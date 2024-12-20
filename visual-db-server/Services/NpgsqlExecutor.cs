using Dapper;
using Npgsql;
using System.Data;

namespace visual_db_server.Services;
public class NpgsqlExecutor : ISqlExecutor, IDisposable
{
    private readonly IDbConnectionProvider _dbConnectionProvider;
    private NpgsqlConnection _db;

    public NpgsqlExecutor(IDbConnectionProvider dbConnectionProvider)
    {
        DefaultTypeMap.MatchNamesWithUnderscores = true;
        _dbConnectionProvider = dbConnectionProvider;
    }

    private NpgsqlConnection GetDbConnection() => _db ??= _dbConnectionProvider.GetDbConnection();

    /// <summary>
    /// TODO: we should remove this after replacing it by Query method below
    /// </summary>
    public IEnumerable<T> ExecuteG<T>(string query)
    {
        var db = GetDbConnection();
        return db.Query<T>(query);
    }

    public IEnumerable<T> Query<T>(string query, object param = null, bool buffered = true)
    {
        var db = GetDbConnection();
        return db.Query<T>(query, param);
    }

    public async Task<IEnumerable<T>> QueryAsync<T>(
        string sql,
        object? param = null,
        IDbTransaction? transaction = null,
        int? commandTimeout = null,
        CommandType? commandType = null)
    {
        var db = GetDbConnection();
        return await db.QueryAsync<T>(sql, param, transaction, commandTimeout, commandType);
    }

    public IEnumerable<IDictionary<string, object>> Query(string query, object param = null)
    {
        var db = GetDbConnection();
        return db.Query(query, param) as IEnumerable<IDictionary<string, object>>;
    }

    public IEnumerable<IDictionary<string, string>> Execute(string query, object param = null)
    {
        var result = Query(query, param);

        if (result == null)
        {
            return new List<IDictionary<string, string>>();
        }

        var finalList = new List<Dictionary<string, object>>();

        foreach (var item in result)
        {
            var dictionary = new Dictionary<string, object>();
            var k = item.Select(s => s.Key).ToList();
            var index = 1;
            foreach (var innerKey in k)
            {
                if (dictionary.ContainsKey(innerKey))
                {
                    var newKey = $"{innerKey}_{index}";
                    var value = item.LastOrDefault(s => s.Key == innerKey).Value;
                    dictionary.Add(newKey, value);
                }
                else
                {
                    var value = item.FirstOrDefault(s => s.Key == innerKey).Value;
                    dictionary.Add(innerKey, value);
                }

                index++;
            }

            finalList.Add(dictionary);
        }
        var outData = finalList.Select(r => r.ToDictionary(d => d.Key, d => d.Value?.ToString()));
        return outData;
    }

    public T ExecuteScalar<T>(string query)
    {
        var db = GetDbConnection();
        return db.ExecuteScalar<T>(query);
    }

    public dynamic QueryFirst(string query)
    {
        var db = GetDbConnection();
        return db.QueryFirst(query);
    }

    public dynamic QueryFirst<T>(string query)
    {
        var db = GetDbConnection();
        return db.QueryFirst<T>(query);
    }

    public dynamic ExecuteQuery<T>(
        string query,
        object? param = null,
        IDbTransaction? transaction = null,
        bool buffered = true,
        int? commandTimeout = null,
        CommandType? commandType = null)
    {
        var db = GetDbConnection();
        return db.Query<T>(query, param, transaction, buffered, commandTimeout, commandType);
    }

    public void ExecuteQuery(
        string sql,
        object? param = null,
        IDbTransaction? transaction = null,
        bool buffered = true,
        int? commandTimeout = null,
        CommandType? commandType = null)
    {
        var db = GetDbConnection();
        db.Query(sql, param, transaction, buffered, commandTimeout, commandType);
    }

    public async Task ExecuteAsync(
        string query,
        object? param = null,
        IDbTransaction? transaction = null,
        int? commandTimeout = null,
        CommandType? commandType = null)
    {
        var db = GetDbConnection();
        await db.ExecuteAsync(query, param, transaction, commandTimeout, commandType);
    }

    /// <summary>Dispose the transaction object after using it.</summary>
    public async Task<IDbTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        OpenConnectionIfNot();

        return await _db.BeginTransactionAsync(cancellationToken);
    }

    /// <summary>Release the TextWriter object after using it. Call BeginTransactionAsync method before using it.</summary>
    public async Task<TextWriter> BeginTextImportAsync(
        string copyFromCommand,
        CancellationToken cancellationToken = default)
    {
        return await _db.BeginTextImportAsync(copyFromCommand, cancellationToken);
    }

    public void Dispose()
    {
        _db?.Dispose();
    }

    private void OpenConnectionIfNot()
    {
        var connection = GetDbConnection();

        if (connection.State == ConnectionState.Open)
            return;

        connection.Open();
    }
}

