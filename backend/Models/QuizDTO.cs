using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace a15.Models;

public class QuizDTO
{
    public int Id { get; set; }
    public string? Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsPublished { get; set; }
    public bool IsClosed { get; set; }
    public bool IsTest { get; set; }
    public DateTimeOffset? Start { get; set; }
    public DateTimeOffset? Finish { get; set; }
    public Database Database { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string TeacherStatus {get; set;} = null!;
    public int Note {get; set;}
    public virtual ICollection<QuestionDTO> Questions { get; set; } = null!;
    public virtual ICollection<AttemptDTO> Attempts { get; set; } = null!;

    [NotMapped]
    public bool HasAttempt;
    public Statut Stat
    {
        get
        {
            var currentDate = DateTimeOffset.UtcNow;

            if (Finish.HasValue && currentDate > Finish.Value)
            {
                return Statut.CLOTURE;
            }

            if (Start.HasValue && Finish.HasValue && currentDate >= Start.Value && currentDate <= Finish.Value)
            {
                return HasAttempt ?  Statut.FINI : Statut.PAS_COMMENCE;
            }

            return Statut.PAS_COMMENCE;
        }
    }

    [NotMapped]
    public Statut TeacherStat
    {
        get
        {
            if (Finish.HasValue && Finish < DateTimeOffset.Now)
            {
                return Statut.CLOTURE;
            }
            return IsPublished ? Statut.PUBLIE : Statut.PAS_PUBLIE;
        }
    }

}

public class NewQuizDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsPublished { get; set; }
    public bool IsTest { get; set; }
    public DateTimeOffset? Start { get; set; }
    public DateTimeOffset? Finish { get; set; }
    public int DatabaseId { get; set; }
    public int TeacherId {get; set;} 
    public virtual ICollection<QuestionDTO> Questions { get; set; } = null!;

}

