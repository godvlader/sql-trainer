using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace a15.Models;

public class Answer {
    [Key]
    public int Id { get; set; }
    public string? Sql { get; set; }
    public DateTimeOffset? Timestamp { get; set; }
    public bool IsCorrect { get; set; }

    [ForeignKey("AttemptId")]
    public int? AttemptId { get; set; }
    [JsonIgnore]
    public Attempt? Attempt { get; set; } = null!;

    public int QuestionId { get; set; }
    public Question? Question { get; set; } = null!; // Navigation property

}
