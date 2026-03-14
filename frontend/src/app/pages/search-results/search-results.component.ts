import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Recipe } from '../../models/recipe.model';
import { RecipeService } from '../../services/recipe.service';
import { RecipeCardComponent } from '../../components/recipe-card/recipe-card.component';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  searchQuery: string | null = null;
  allRecipes: Recipe[] = [];
  results: Recipe[] = [];

  private route = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.searchQuery = params.get('query');
      this.loadAndFilterRecipes();
    });
  }

  loadAndFilterRecipes(): void {
    this.recipeService.getRecipes().subscribe(data => {
      this.allRecipes = data;
      this.filterRecipes();
    });
  }

  filterRecipes(): void {
    if (!this.searchQuery) {
      this.results = [];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    const titleMatches: Recipe[] = [];
    const ingredientMatches: Recipe[] = [];

    // Use a Set to avoid duplicate recipes in the results
    const addedRecipeIds = new Set<number>();

    for (const recipe of this.allRecipes) {
      if (recipe.title.toLowerCase().includes(query)) {
        if (!addedRecipeIds.has(recipe.id)) {
          titleMatches.push(recipe);
          addedRecipeIds.add(recipe.id);
        }
      }
    }

    for (const recipe of this.allRecipes) {
       if (recipe.ingredients.toLowerCase().includes(query)) {
        if (!addedRecipeIds.has(recipe.id)) {
          ingredientMatches.push(recipe);
          addedRecipeIds.add(recipe.id);
        }
      }
    }

    this.results = [...titleMatches, ...ingredientMatches];
  }
}
