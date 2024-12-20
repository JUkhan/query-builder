using Npgsql;

namespace visual_db_server.Services;
public interface IDbConnectionProvider : IDisposable
{
    NpgsqlConnection GetDbConnection();
    string GetConnectionString();
}
