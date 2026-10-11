namespace BuildingBlocks.Exceptions;

/// <summary>Caller is authenticated but does not own/may not access the requested resource.</summary>
public class ForbiddenAccessException : Exception
{
    public ForbiddenAccessException()
        : base("You do not have permission to access this resource.")
    {
    }

    public ForbiddenAccessException(string message) : base(message)
    {
    }
}
