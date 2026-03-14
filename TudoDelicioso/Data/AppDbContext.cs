using Microsoft.EntityFrameworkCore;
using TudoDelicioso.Models;

namespace TudoDelicioso.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Recipe> Recipes => Set<Recipe>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<UserFavoriteRecipe> UserFavoriteRecipes => Set<UserFavoriteRecipe>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Prevent cascade delete issues with Review -> User
        modelBuilder.Entity<Review>()
            .HasOne(r => r.User)
            .WithMany(u => u.Reviews)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        // Configure Composite Key for Favorites
        modelBuilder.Entity<UserFavoriteRecipe>()
            .HasKey(ufr => new { ufr.UserId, ufr.RecipeId });

        modelBuilder.Entity<UserFavoriteRecipe>()
            .HasOne(ufr => ufr.User)
            .WithMany()
            .HasForeignKey(ufr => ufr.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        // Seed initial categories matching the TudoGostoso menu
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Almoço de Páscoa" },
            new Category { Id = 2, Name = "Carnes" },
            new Category { Id = 3, Name = "Aves" },
            new Category { Id = 4, Name = "Peixes e Frutos do Mar" },
            new Category { Id = 5, Name = "Saladas e Molhos" },
            new Category { Id = 6, Name = "Sopas" },
            new Category { Id = 7, Name = "Massas" },
            new Category { Id = 8, Name = "Bebidas" },
            new Category { Id = 9, Name = "Doces e Sobremesas" },
            new Category { Id = 10, Name = "Lanches" },
            new Category { Id = 11, Name = "Alimentação Saudável" }
        );
    }
}
