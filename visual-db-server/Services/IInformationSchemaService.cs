using visual_db_server.Models;

namespace visual_db_server.Services;

public interface IInformationSchemaService
{
    string GetColumnDataType(string schema, string tableName, string columnName);

    IEnumerable<string> GetTableColumnNames(string schema, string tableName);

    IEnumerable<TableColumn> GetTableColumnsWithDataType(string schema, string tableName);

    bool CheckIfExistsInSchema(string schema, string tableName);

    bool IsTableExists(string tableName, string schemaName = "public");

    bool IsSchemaExists(string schema);
}
