using System.Runtime.Serialization;

namespace visual_db_server.Models;

public class CrudException : Exception
{
    public CrudException()
    {
    }

    public CrudException(string message) : base(message)
    {
    }

    public CrudException(string message, Exception innerException) : base(message, innerException)
    {
    }

    protected CrudException(SerializationInfo info, StreamingContext context) : base(info, context)
    {
    }
}
