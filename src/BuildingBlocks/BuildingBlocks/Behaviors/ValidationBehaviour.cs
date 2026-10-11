using BuildingBlocks.CQRS;
using FluentValidation;
using MediatR;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;

namespace BuildingBlocks.Behaviors
{
    // Was constrained to ICommand<TResponse>, so queries were never validated regardless of
    // whether a validator existed for them (e.g. a client could request PageSize=1000000).
    // IRequest<TResponse> is the common base of both ICommand<T> and IQuery<T>; a request type
    // with no registered validator behaves exactly as before (empty validators list, no-op).
    public class ValidationBehavior<TRequest, TResponse>
    (IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
    {
        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            var context = new ValidationContext<TRequest>(request);

            var validationResults =
                await Task.WhenAll(
                    validators.Select(v => v.ValidateAsync(context, cancellationToken)));

            var failures =
                validationResults
                    .Where(r => r.Errors.Any())
                    .SelectMany(r => r.Errors)
                    .ToList();
            if (failures.Any())
                throw new FluentValidation.ValidationException(failures);

            return await next();


        }
    }
}
