using System.ComponentModel.DataAnnotations;

namespace a15.Models;

public class Database{

    [Key]
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Description {get; set;}
}