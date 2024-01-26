using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace a15.Models;

public enum Statut
{
     EN_COURS = 0,
     FINI = 1,
     PAS_COMMENCE = 2,
     CLOTURE = 3,
     PUBLIE = 4,
     PAS_PUBLIE = 5,
}


 public class Quiz {
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsPublished { get; set; }
    public bool? IsClosed { get; set; }
    public bool IsTest { get; set; }
    public DateTimeOffset? Start { get; set; }
    public DateTimeOffset? Finish { get; set; }
    [NotMapped]
    public Statut Status {get; set;}
    [NotMapped]
    public int Note {get; set;}
     [NotMapped]
    public Statut TeacherStatus {get; set;}

    [ForeignKey("DatabaseId")]
    public int DatabaseId { get; set; }
    public virtual Database Database { get; set; } = null!;

    [ForeignKey("TeacherId")]
    public int TeacherId { get; set; }
    public Teacher Teacher { get; set; } = null!;
    public virtual ICollection<Question> Questions {get; set;} = new List<Question>();
    public virtual ICollection<Answer> Answers {get; set;} = new HashSet<Answer>();
    public virtual ICollection<Attempt> Attempts {get; set;} = new HashSet<Attempt>();
    
    [NotMapped]
    public bool HasAttempt { get; set; }

    public List<string> ValidateQuizDates(Quiz quiz)
     {
     var currentDate = DateTimeOffset.UtcNow.Date; // UTC time for comparison
     var errors = new List<string>();

     if (quiz.Start.HasValue && quiz.Start.Value.UtcDateTime.Date < currentDate)
     {
          errors.Add("Start date cannot be in the past.");
     }
     if (quiz.Finish.HasValue && quiz.Finish.Value.Date < currentDate)
     {
          errors.Add("Finish date cannot be in the past.");
     }
     if (quiz.Start.HasValue && quiz.Finish.HasValue && quiz.Start.Value.Date > quiz.Finish.Value.Date)
     {
          errors.Add("Start date must be before or on the same day as the finish date.");
     }

     return errors;
     }





}
