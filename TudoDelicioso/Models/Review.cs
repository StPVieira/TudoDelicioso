namespace TudoDelicioso.Models;

public class Review
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int Rating { get; set; } // 1 to 5
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int RecipeId { get; set; }
    public Recipe? Recipe { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }
}
