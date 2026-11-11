namespace Hsus.Admission.Api.Exceptions;

public abstract class DomainException : Exception
{
    public int StatusCode { get; }
    public string Title { get; }
    public object? AdditionalDetails { get; }

    protected DomainException(string message, int statusCode, string title, object? additionalDetails = null)
        : base(message)
    {
        StatusCode = statusCode;
        Title = title;
        AdditionalDetails = additionalDetails;
    }
}

public class BadRequestDomainException : DomainException
{
    public BadRequestDomainException(string message, object? additionalDetails = null)
        : base(message, StatusCodes.Status400BadRequest, "Bad Request", additionalDetails)
    {
    }
}

public class ForbiddenDomainException : DomainException
{
    public ForbiddenDomainException(string message, object? additionalDetails = null)
        : base(message, StatusCodes.Status403Forbidden, "Forbidden", additionalDetails)
    {
    }
}

public class NotFoundDomainException : DomainException
{
    public NotFoundDomainException(string message, object? additionalDetails = null)
        : base(message, StatusCodes.Status404NotFound, "Not Found", additionalDetails)
    {
    }
}

public class ConflictDomainException : DomainException
{
    public ConflictDomainException(string message, object? additionalDetails = null)
        : base(message, StatusCodes.Status409Conflict, "Conflict", additionalDetails)
    {
    }
}

