namespace visual_db_server.Services;

public interface IRawSqlQueryService
{
    bool IsDataExists(string table, string whereClause, string schema = "public");

    IEnumerable<dynamic> GetRecords(string table, string schema = "public");

    T? GetRecordById<T>(string table, string id, string selectClause);
}
