namespace a15.Models;

public class AnswerDTO
{
    public int Id { get; set; }
    public string? Sql { get; set; }
    public DateTimeOffset Timestamp { get; set; }
    public bool IsCorrect { get; set; }
    public int QuestionId { get; set; } 
    public int AttemptId { get; set; }

}
