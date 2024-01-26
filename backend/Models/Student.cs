using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace a15.Models;

public class Student : User{

    public Student(){
        Role = Role.Student;
    }
    
    public virtual ICollection<Question> QuestionsStud {get; set;} = new HashSet<Question>();
    public virtual ICollection<Quiz> Quizzes {get; set;} = new HashSet<Quiz>();
    public virtual ICollection<Attempt> Attempts {get; set;} = new HashSet<Attempt>();
}
