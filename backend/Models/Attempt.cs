using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace a15.Models;

public class Attempt{
    [Key]
    public int Id { get; set; }
    public DateTimeOffset Start { get; set; }
    public DateTimeOffset? Finish { get; set; }

    [ForeignKey("QuizId")]
    public int QuizId { get; set; }
    [JsonIgnore]
    public Quiz Quiz { get; set; } = null!;

    [ForeignKey("Student")]
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public List<Answer> Answers { get; internal set; } = null!;

}