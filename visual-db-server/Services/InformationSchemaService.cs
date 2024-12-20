using System.Text.RegularExpressions;
using visual_db_server.Models;

namespace visual_db_server.Services;

public class InformationSchemaService : IInformationSchemaService
{
    private readonly ISqlExecutor _sqlExecutor;

    public InformationSchemaService(ISqlExecutor sqlExecutor)
    {
        _sqlExecutor = sqlExecutor;
    }

    public string GetColumnDataType(string schema, string tableName, string columnName)
    {
        var query = $@"
                SELECT pg_catalog.format_type(pga.atttypid, pga.atttypmod) as data_type
                FROM pg_catalog.pg_attribute pga
                WHERE pga.attrelid = '{schema}.{tableName}'::regclass
                  AND pga.attname = '{columnName}'
                  AND pga.attnum > 0;
            ";

        return _sqlExecutor.ExecuteG<string>(query).First();
    }

    public IEnumerable<string> GetTableColumnNames(string schema, string tableName)
    {
        if (tableName.Contains("("))
        {
            var tableColumnList = GetTableColumnsWithDataType(schema, tableName)
                                 .ToList().Select(x => x.ColumnName)
                                 .ToList();
            return tableColumnList;
        }

        var query = $@"
                SELECT pga.attname as column_name
                FROM pg_catalog.pg_attribute pga
                WHERE pga.attrelid = '{schema}.{tableName}'::regclass
                  AND pga.attnum > 0;
            ";

        return _sqlExecutor.ExecuteG<string>(query);
    }

    public IEnumerable<TableColumn> GetTableColumnsWithDataType(string schema, string tableName)
    {
        if (tableName.Contains("("))
        {
            var functionName = tableName.Split('(')[0];
            var functionInfoQuery = $@"SELECT
                   -- n.nspname AS ""Schema"",
                   -- p.proname AS ""Function Name"",
                    pg_catalog.pg_get_function_result(p.oid) AS return_type
                   -- pg_catalog.pg_get_function_arguments(p.oid) AS ""Arguments"",
                   -- pg_catalog.pg_get_functiondef(p.oid) AS ""Function Definition""
                FROM
                    pg_catalog.pg_proc p
                JOIN
                    pg_catalog.pg_namespace n ON n.oid = p.pronamespace
                WHERE
                    p.proname = lower('{functionName}')
                    --AND pg_catalog.pg_function_is_visible(p.oid)
                    AND n.nspname = '{schema}'  -- Replace with your schema name
                ORDER BY
                    1;
                ";
            var returnType = _sqlExecutor.ExecuteG<string>(functionInfoQuery)
                            .FirstOrDefault();
            string pattern = @$"(\w+)\s+(\w+)";
            var matches = Regex.Matches(returnType, pattern);
            var tableColumnList = new List<TableColumn>();
            foreach (Match match in matches)
            {
                // Check if the match has the right number of groups
                if (match.Groups.Count == 3)
                {
                    // Group[1] is the column name
                    string columnName = match.Groups[1].Value;
                    // Group[2] is the column type
                    string columnType = match.Groups[2].Value;
                    // Add the result to the list
                    tableColumnList.Add(new TableColumn
                    {
                        ColumnName = columnName,
                        DataType = columnType,
                    });
                }
            }
            return tableColumnList;
        }
        var query = $@"
                SELECT pga.attname                                         as ColumnName,
                       pg_catalog.format_type(pga.atttypid, pga.atttypmod) as DataType
                FROM pg_catalog.pg_attribute pga
                WHERE pga.attrelid = '{schema}.{tableName}'::regclass
                  AND pga.attnum > 0
                  AND NOT pga.attisdropped;
            ";

        return _sqlExecutor.ExecuteG<TableColumn>(query);
    }

    /// <summary>
    /// This method checks if a table, view or materialized view exists in a certain schema
    /// </summary>
    /// <param name="schema">The schema/namespace to search in pg_namespace</param>
    /// <param name="tableName">The name of the table to search in pg_class</param>
    /// <returns>True/False</returns>
    public bool CheckIfExistsInSchema(string schema, string tableName)
    {
        var table = string.IsNullOrEmpty(tableName) ? string.Empty : tableName.ToLower();
        if (table.Contains(")"))
        {
            var getTableColumnList = GetTableColumnsWithDataType(schema, tableName);
            if (getTableColumnList.ToList().Count == 0)
                return false;
            else return true;
        }
        var query = $@"
                select exists (select pgn.nspname, pgc.relname, pgc.relkind
                               from pg_catalog.pg_class pgc
                                        join pg_catalog.pg_namespace pgn on pgc.relnamespace = pgn.oid
                               where pgc.relname = '{table}'
                                 and pgc.relkind in ('r', 'v', 'm')
                                 and pgn.nspname = '{schema}');
            ";

        return _sqlExecutor.ExecuteG<bool>(query).First();
    }

    public bool IsTableExists(string tableName, string schemaName = "public")
    {
        var query = @$"
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = '{schemaName}'
                    AND table_name = '{tableName}'
                );
            ";

        return _sqlExecutor.QueryFirst<bool>(query);
    }

    public bool IsSchemaExists(string schema)
    {
        var sql = @$"
                SELECT EXISTS (
                  SELECT
                  FROM pg_catalog.pg_namespace
                  WHERE nspname = '{schema}'
                );
            ";

        return _sqlExecutor.QueryFirst<bool>(sql);
    }
}