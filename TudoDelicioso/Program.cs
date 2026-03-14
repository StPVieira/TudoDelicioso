using Microsoft.EntityFrameworkCore;
using TudoDelicioso.Data;
using TudoDelicioso.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

// Configure CORS for Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Configure Entity Framework Core with SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// --- API Endpoints ---

// Users CRUD
app.MapGet("/api/users", async (AppDbContext db) =>
    await db.Users.ToListAsync());

app.MapGet("/api/users/{id}", async (int id, AppDbContext db) =>
    await db.Users.FindAsync(id) is User user ? Results.Ok(user) : Results.NotFound());

app.MapPost("/api/users", async (User user, AppDbContext db) =>
{
    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Created($"/api/users/{user.Id}", user);
});

app.MapPut("/api/users/{id}", async (int id, User inputUser, AppDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    if (user is null) return Results.NotFound();

    user.Name = inputUser.Name;
    user.Email = inputUser.Email;
    user.PasswordHash = inputUser.PasswordHash;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/users/{id}", async (int id, AppDbContext db) =>
{
    if (await db.Users.FindAsync(id) is User user)
    {
        db.Users.Remove(user);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
    return Results.NotFound();
});

// Categories (Read-Only for now)
app.MapGet("/api/categories", async (AppDbContext db) =>
    await db.Categories.ToListAsync());

// Recipes CRUD
app.MapGet("/api/recipes", async (AppDbContext db) =>
    await db.Recipes.Include(r => r.Category).Include(r => r.User).ToListAsync());

app.MapGet("/api/recipes/{id}", async (int id, AppDbContext db) =>
    await db.Recipes.Include(r => r.Category).Include(r => r.User).FirstOrDefaultAsync(r => r.Id == id)
        is Recipe recipe ? Results.Ok(recipe) : Results.NotFound());

app.MapPost("/api/recipes", async (Recipe recipe, AppDbContext db) =>
{
    db.Recipes.Add(recipe);
    await db.SaveChangesAsync();
    return Results.Created($"/api/recipes/{recipe.Id}", recipe);
});

app.MapPut("/api/recipes/{id}", async (int id, Recipe inputRecipe, AppDbContext db) =>
{
    var recipe = await db.Recipes.FindAsync(id);
    if (recipe is null) return Results.NotFound();

    recipe.Title = inputRecipe.Title;
    recipe.Description = inputRecipe.Description;
    recipe.Ingredients = inputRecipe.Ingredients;
    recipe.Instructions = inputRecipe.Instructions;
    recipe.ImageUrl = inputRecipe.ImageUrl;
    recipe.CategoryId = inputRecipe.CategoryId;
    recipe.UserId = inputRecipe.UserId;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/recipes/{id}", async (int id, AppDbContext db) =>
{
    if (await db.Recipes.FindAsync(id) is Recipe recipe)
    {
        db.Recipes.Remove(recipe);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
    return Results.NotFound();
});

// Reviews CRUD
app.MapGet("/api/recipes/{id}/reviews", async (int id, AppDbContext db) =>
    await db.Reviews.Include(r => r.User).Where(r => r.RecipeId == id).OrderByDescending(r => r.CreatedAt).ToListAsync());

app.MapPost("/api/recipes/{id}/reviews", async (int id, Review review, AppDbContext db) =>
{
    var recipe = await db.Recipes.FindAsync(id);
    if (recipe is null) return Results.NotFound("Receita não encontrada.");

    // Regra: O usuário não pode avaliar a própria receita.
    if (recipe.UserId == review.UserId) 
    {
        return Results.BadRequest("Você não pode avaliar sua própria receita.");
    }

    // Regra: Limitação de 1 review por usuário por receita.
    var existingReview = await db.Reviews.FirstOrDefaultAsync(r => r.RecipeId == id && r.UserId == review.UserId);
    if (existingReview != null)
    {
        return Results.BadRequest("Você já avaliou esta receita.");
    }

    review.RecipeId = id;
    review.CreatedAt = DateTime.UtcNow;
    db.Reviews.Add(review);
    await db.SaveChangesAsync();

    // Fetch user so we can return it with the object (to display the name immediately in UI)
    await db.Entry(review).Reference(r => r.User).LoadAsync();

    return Results.Created($"/api/recipes/{id}/reviews/{review.Id}", review);
});

// Favorites CRUD
app.MapPost("/api/recipes/{id}/favorite", async (int id, int userId, AppDbContext db) =>
{
    var exists = await db.UserFavoriteRecipes.AnyAsync(f => f.RecipeId == id && f.UserId == userId);
    if (exists) return Results.BadRequest("Já favoritado.");

    db.UserFavoriteRecipes.Add(new UserFavoriteRecipe { RecipeId = id, UserId = userId });
    await db.SaveChangesAsync();
    return Results.Ok();
});

app.MapDelete("/api/recipes/{id}/favorite", async (int id, int userId, AppDbContext db) =>
{
    var favorite = await db.UserFavoriteRecipes.FirstOrDefaultAsync(f => f.RecipeId == id && f.UserId == userId);
    if (favorite == null) return Results.NotFound();

    db.UserFavoriteRecipes.Remove(favorite);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapGet("/api/recipes/{id}/favorite/check", async (int id, int userId, AppDbContext db) =>
{
    var exists = await db.UserFavoriteRecipes.AnyAsync(f => f.RecipeId == id && f.UserId == userId);
    return Results.Ok(new { isFavorite = exists });
});

app.MapGet("/api/users/{userId}/favorites", async (int userId, AppDbContext db) =>
{
    var favorites = await db.UserFavoriteRecipes
        .Include(f => f.Recipe).ThenInclude(r => r.User) // We need the user (author) to render the Recipe Card properly
        .Where(f => f.UserId == userId)
        .Select(f => f.Recipe)
        .ToListAsync();
    
    return Results.Ok(favorites);
});

app.Run();
