using a15.Models;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

public class QuizValidator : AbstractValidator<Quiz>
{
    private readonly PridContext _context;

    public QuizValidator(PridContext context)
    {
        _context = context;

        RuleFor(q => q.Name)
            .NotEmpty().WithMessage("Quiz name is required.")
            .MinimumLength(3).WithMessage("Quiz name must be at least 3 characters.")
            .MustAsync(BeUniqueName).WithMessage("Quiz name must be unique.");

        RuleFor(q => q.Questions)
            .NotEmpty().WithMessage("Quiz must have at least one question.")
            .Must(HaveUniqueOrderQuestions).WithMessage("Each question must have a unique order.");

        RuleFor(q => q)
            .Must(HaveValidDates).When(q => q.IsTest).WithMessage("Test quiz must have valid start and end dates.");

        RuleForEach(q => q.Questions)
            .SetValidator(new QuestionValidator());

        RuleFor(q => q)
            .MustAsync(NoAttemptsIfTest).When(q => q.IsTest).WithMessage("Test quiz cannot be modified if there are attempts.");

            // When clause to apply these date-related rules only when the IsTest property of the Quiz is true.
            When(q => q.IsTest, () =>
            {
                RuleFor(q => q)
                    .Must(StartDateBeforeEndDate).WithMessage("Start date must be before end date.");

                RuleFor(q => q.Start)
                    .Must(StartDayAtLeastToday)
                    .WithMessage("Start date must be today or a future date.");
            });
    }

    private bool HaveValidDates(Quiz quiz)
    {
        var validationErrors = quiz.ValidateQuizDates(quiz);
        return validationErrors.Count == 0;
    }


    private bool HaveUniqueOrderQuestions(IEnumerable<Question> questions)
    {
        return questions.Select(q => q.Order).Distinct().Count() == questions.Count();
    }

    private async Task<bool> BeUniqueName(string name, CancellationToken token)
    {
        return !await _context.Quizzes.AnyAsync(q => q.Name == name, token);
    }

    private async Task<bool> NoAttemptsIfTest(Quiz quiz, CancellationToken token)
    {
        return !await _context.Attempts.AnyAsync(a => a.QuizId == quiz.Id, token);
    }

    public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(Quiz quiz) {
        return await this.ValidateAsync(quiz, o => o.IncludeRuleSets());
    }

    private bool StartDateBeforeEndDate(Quiz quiz)
    {
        return !quiz.Start.HasValue || !quiz.Finish.HasValue || quiz.Start <= quiz.Finish;
    }

    private bool StartDayAtLeastToday(DateTimeOffset? startDate)
    {
        return startDate.HasValue && startDate.Value.Date >= DateTimeOffset.Now.Date;
    }

}

public class QuestionValidator : AbstractValidator<Question>
{
    public QuestionValidator()
    {
        RuleFor(q => q.Body)
            .NotEmpty().WithMessage("Question body is required.")
            .MinimumLength(2).WithMessage("Question body must be at least 2 characters.");

        RuleFor(q => q.Solutions)
            .NotEmpty().WithMessage("Question must have at least one solution.");

        RuleForEach(q => q.Solutions)
            .Must(s => !string.IsNullOrWhiteSpace(s.Sql)).WithMessage("Solution SQL cannot be empty.");
    }

    public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(Question question) {
        return await this.ValidateAsync(question, o => o.IncludeRuleSets());
    }
}
