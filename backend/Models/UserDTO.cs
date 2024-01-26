using System.ComponentModel.DataAnnotations;

namespace a15.Models;

public class UserDTO
{
    public int Id { get; set; }
    public string? Pseudo { get; set; }
    public string? Email { get; set; }
    public string? Password {get; set;}
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? FullName {get; set;}
    public DateTime? BirthDate { get; set; }
    public string? RefreshToken { get; set; }
    public Role Role { get; set; }
    public string? Token { get; set; }
}


public class  UserWithPasswordDTO : UserDTO
{
    [Required]
    public new string Password { get; set;} = null!;
}

public class UserLoginDTO : UserDTO{

    public string PseudoLogin { get; set;} = null!;
    public string PasswordLogin { get; set;} = null!;

}

public class UserSignupDTO : UserDTO{
    public string? PseudoSignUp { get; set; }= null!;
    public string? EmailSignUp { get; set; }= null!;
    public string? PasswordSignUp { get; set;}= null!;
    public string? FullNameSignup { get; set; }= null!;
    public DateTime? BirthDateSignUp { get; set; }
}

public class UserUpdateDTO : UserDTO{
    public string? PseudoUpdate { get; set; }
    public string? EmailUpdate { get; set; }
    public string? PasswordUpdate {get; set;}
    public string? FullNameUpdate {get; set;}
    public DateTime? BirthDateUpdate { get; set; }
    public Role? RoleUpdate {get; set;}
}