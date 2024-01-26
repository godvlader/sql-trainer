using FluentValidation;
using Microsoft.EntityFrameworkCore;
using a15.Helpers;
using System.Text.RegularExpressions;

namespace a15.Models;

public class UserValidator : AbstractValidator<User>
{
     private readonly PridContext _context;

    public UserValidator(PridContext context)
    {
        _context = context;

        RuleFor(u => u.Pseudo)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(10)
            .Matches(@"^[a-z][a-z0-9_]+$", RegexOptions.IgnoreCase);


        RuleFor(u => u.Email)
            .EmailAddress().WithMessage("Invalid email cono");

        RuleFor(u => u.LastName)
            .MinimumLength(3)
            .MaximumLength(50)
            .Matches(@"^\S.*\S$");
            

        RuleFor(u => u.FirstName)
            .MinimumLength(3)
            .MaximumLength(50)
            .Matches(@"^\S.*\S$");;

        RuleFor(u => u.FullName)
            .MinimumLength(3).WithMessage("au moins 3 lettres ");


        RuleFor(u => u.Password)
            .MinimumLength(3)
            .MaximumLength(200);

        RuleFor(m => m.Role)
        .IsInEnum();

        // Validations spécifiques pour l'authentification
        RuleSet("authenticate", () => {
            RuleFor(m => m.Token)
                .NotNull().OverridePropertyName("Password").WithMessage("Incorrect password.");
        });

        RuleFor(u => new { u.LastName, u.FirstName})
                            .Must(u => string.IsNullOrEmpty(u.LastName) && string.IsNullOrEmpty(u.FirstName) ||
                            !string.IsNullOrEmpty(u.LastName) && !string.IsNullOrEmpty(u.FirstName))
                            .WithMessage("LN and FN must be both empty or both not empty");

        RuleFor(u => new {u.Id, u.Pseudo})
                                    .MustAsync((u, token) => BeUniquePseudo(u.Id, u.Pseudo, token))
                                    .OverridePropertyName(nameof(User.Pseudo))
                                    .WithMessage("'{PropertyName}' must be unique");

        RuleFor(u => new {u.Id, u.Email})
                                    .MustAsync((u, token) => BeUniqueEmail(u.Id, u.Email, token))
                                    .OverridePropertyName(nameof(User.Email))
                                    .WithMessage("'{PropertyName}' must be unique");    

        RuleFor(u => new{u.Id, u.FirstName, u.LastName})
                                    .MustAsync((u,token) => BeUniqueFullName(u.Id, u.FirstName, u.LastName, token))
                                    .WithMessage("The combination of FN and LN must be unique");

        }

        public async Task<FluentValidation.Results.ValidationResult> ValidateForAuthenticate(User? user) {
            if (user == null)
                return ValidatorHelper.CustomError("User not found.", "Pseudo");
            return await this.ValidateAsync(user!, o => o.IncludeRuleSets("authenticate"));
        }

        private async Task<bool> BeUniquePseudo(int id, string pseudo, CancellationToken token){
            if(pseudo == null) return false;
            return !await _context.Users.AnyAsync(u => u.Id != id && u.Pseudo == pseudo, cancellationToken:token);
        }                        

        private async Task<bool> BeUniqueEmail(int id, string email, CancellationToken token){
            if(email == null) return false;
            return !await _context.Users.AnyAsync(u => u.Id != id && u.Email == email, cancellationToken:token);
        }

        private async Task<bool> BeUniqueFullName(int id, string? lastName, string? firstName, CancellationToken token){
            if(lastName == null && firstName == null) return true;
            return !await _context.Users.AnyAsync(u => u.Id != id && u.LastName == lastName && u.FirstName == firstName, cancellationToken: token); 
        }

        public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(User member) {
            return await this.ValidateAsync(member, o => o.IncludeRuleSets());
        }
}
