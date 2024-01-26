using System.ComponentModel.DataAnnotations;

namespace a15.Models;

public class QuestionDTO
{
    public int Id { get; set; }
    public int Order { get; set; }
    public string? Body { get; set; }
    public int QuizId { get; set; } 
    public virtual ICollection<AnswerDTO> Answers { get; set; } = new List<AnswerDTO>();
    public virtual ICollection<SolutionDTO> Solutions { get; set; } = new List<SolutionDTO>();
    public object? QuizName { get; internal set; }
    public object? QuizDbName { get; internal set; }
    public Database? Database { get; set;}
    public bool IsTest { get; set; }
}