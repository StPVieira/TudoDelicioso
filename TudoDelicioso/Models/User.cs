namespace TudoDelicioso.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    
    public ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
