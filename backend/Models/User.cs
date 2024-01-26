using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace a15.Models;

public enum Role 
{
    Admin = 2, Teacher = 1, Student = 0
}


public class User
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string Pseudo { get; set; } = null!;
    [Required]
    public string Password { get; set; } = null!;
    [Required]
    public string Email { get; set; } = null!;
    public string? LastName { get; set; }
    public string? FirstName { get; set; }
    public string? FullName { get; set; }
    public DateTime? BirthDate { get; set; }
    public Role Role { get; set; } = Role.Student;
    public string? RefreshToken { get; set; }
    [NotMapped]
    public string? Token { get; set; }


    public int? Age {
        get {
            if (!BirthDate.HasValue)
                return null;
            var today = DateTime.Today;
            var age = today.Year - BirthDate.Value.Year;
            if (BirthDate.Value.Date > today.AddYears(-age)) age--;
            return age;
        }
    }

}
