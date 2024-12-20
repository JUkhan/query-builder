namespace visual_db_server.Services;

public class RawSqlQueryService : IRawSqlQueryService
{
    private readonly ISqlExecutor _sqlExecutor;

    public RawSqlQueryService(ISqlExecutor sqlExecutor) => _sqlExecutor = sqlExecutor;

    public bool IsDataExists(string table, string whereClause, string schema = "public")
    {
        return _sqlExecutor.QueryFirst<bool>($@"
            SELECT EXISTS (
                SELECT id FROM ""{schema}"".""{table}""
                WHERE {whereClause}
                LIMIT 1
            );
        ");
    }

    public IEnumerable<dynamic> GetRecords(string table, string schema = "public")
    {
        if (string.IsNullOrEmpty(table)) return new List<dynamic>();

        var query = $"SELECT * FROM {schema}.\"{table}\";";

        return _sqlExecutor.Query<dynamic>(query);
    }

    public T? GetRecordById<T>(string table, string id, string selectClause)
    {
        var query = @$"
            SELECT
              {selectClause}
            FROM ""{table}""
            WHERE id = '{id}';
        ";

        return _sqlExecutor.Query<T>(query).FirstOrDefault();
    }
}
