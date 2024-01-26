using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace a15.Models;

public class Teacher : User{
    public Teacher()
    {
        Role = Role.Teacher;
    }
    
    public virtual ICollection<Question> QuestionsProf {get; set;} = new HashSet<Question>();
    public virtual ICollection<Quiz> QuizzesProf {get; set;} = new HashSet<Quiz>();
}