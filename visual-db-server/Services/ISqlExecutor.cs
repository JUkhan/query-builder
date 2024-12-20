
using System.Data;

namespace visual_db_server.Services;

public interface ISqlExecutor
{
    /// <summary>
    /// TODO: we should remove this after replacing it by Query method below
    /// </summary>
    IEnumerable<T> ExecuteG<T>(string query);

    IEnumerable<T> Query<T>(string query, object param = null, bool buffered = true);

    IEnumerable<IDictionary<string, object>> Query(string query, object param = null);

    IEnumerable<IDictionary<string, string>> Execute(string query, object param = null);

    T ExecuteScalar<T>(string query);

    dynamic QueryFirst(string query);

    dynamic QueryFirst<T>(string query);

    dynamic ExecuteQuery<T>(string query,
        object? param = null,
        IDbTransaction? transaction = null,
        bool buffered = true,
        int? commandTimeout = null,
        CommandType? commandType = null);

    void ExecuteQuery(
        string sql,
        object? param = null,
        IDbTransaction? transaction = null,
        bool buffered = true,
        int? commandTimeout = null,
        CommandType? commandType = null);

    Task ExecuteAsync(string query,
        object? param = null,
        IDbTransaction? transaction = null,
        int? commandTimeout = null,
        CommandType? commandType = null);

    Task<IDbTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);

    Task<TextWriter> BeginTextImportAsync(string copyFromCommand, CancellationToken cancellationToken = default);

    Task<IEnumerable<T>> QueryAsync<T>(
        string sql,
        object? param = null,
        IDbTransaction? transaction = null,
        int? commandTimeout = null,
        CommandType? commandType = null);
}