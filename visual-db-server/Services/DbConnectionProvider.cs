using Npgsql;

namespace visual_db_server.Services;

public class DbConnectionProvider(IConfiguration configuration) : IDbConnectionProvider
{
    private string _connectionString = configuration.GetConnectionString("VisualDBContext")??string.Empty;
    private NpgsqlConnection _npgsqlConnection;

    public string GetConnectionString()
    {
        return _connectionString;
    }

    public NpgsqlConnection GetDbConnection()
    {
        if (string.IsNullOrWhiteSpace(GetConnectionString()))
        {
            return default;
        }

        if (_npgsqlConnection == null)
            _npgsqlConnection = new NpgsqlConnection(GetConnectionString());

        return _npgsqlConnection;
    }

    public void Dispose()
    {
        if (_npgsqlConnection != null)
        {
            _npgsqlConnection.Dispose();
        }
    }
}