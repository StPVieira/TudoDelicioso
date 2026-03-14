import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe } from '../models/recipe.model';
import { Category } from '../models/category.model';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = 'http://localhost:5152/api/recipes';
  private categoriesUrl = 'http://localhost:5152/api/categories';
  private http = inject(HttpClient);

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl);
  }

  getRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.apiUrl);
  }

  getRecipe(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`);
  }

  createRecipe(recipe: Recipe): Observable<Recipe> {
    return this.http.post<Recipe>(this.apiUrl, recipe);
  }

  updateRecipe(id: number, recipe: Recipe): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, recipe);
  }

  deleteRecipe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Favorite-related methods
  isFavorite(recipeId: number, userId: number): Observable<{ isFavorite: boolean }> {
    return this.http.get<{ isFavorite: boolean }>(`${this.apiUrl}/${recipeId}/favorite/check?userId=${userId}`);
  }

  addToFavorites(recipeId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${recipeId}/favorite?userId=${userId}`, null);
  }

  removeFromFavorites(recipeId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${recipeId}/favorite?userId=${userId}`);
  }

  getReviews(recipeId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/${recipeId}/reviews`);
  }

  addReview(recipeId: number, review: Review): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/${recipeId}/reviews`, review);
  }
}
