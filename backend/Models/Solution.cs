using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace a15.Models;

public class Solution{
    [Key]
    public int Id { get; set; }
    public int Order { get; set; }
    public string? Sql { get; set; }

    [ForeignKey("Question")]
    public int QuestionId { get; set; }
    public Question Question { get; set; } = null!;
    
}