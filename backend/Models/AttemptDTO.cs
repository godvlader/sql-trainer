using System.ComponentModel.DataAnnotations;

namespace a15.Models;

public class AttemptDTO
{
    public int Id { get; set; }
    public DateTimeOffset Start { get; set; }
    public DateTimeOffset? Finish { get; set; }
    public int QuizId { get; set; }
    public bool IsFinished { get; set; }

    public int StudentId { get; set; }
    public ICollection<AnswerDTO> Answers { get; set; } = new List<AnswerDTO>();
    public ICollection<QuestionDTO> Questions { get; set; } = new List<QuestionDTO>();
}

public class FinishAttemptDTO
{
    public int AttemptId { get; set; }
    public DateTimeOffset? Finish { get; set; }
}

public class AttemptRequestDTO
{
    public int QuizId { get; set; }
    public int UserId { get; set; }
}

