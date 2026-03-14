namespace TudoDelicioso.Models;

public class Recipe
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Ingredients { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
    
    public int UserId { get; set; }
    public User? User { get; set; }

    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
