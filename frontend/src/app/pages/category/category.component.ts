import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Recipe } from '../../models/recipe.model';
import { RecipeService } from '../../services/recipe.service';
import { RecipeCardComponent } from '../../components/recipe-card/recipe-card.component';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  recipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];
  categoryName: string | null = null;

  private route = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);

  ngOnInit(): void {
    // We subscribe to paramMap to react to changes in the URL (e.g., navigating from one category to another)
    this.route.paramMap.subscribe(params => {
      this.categoryName = params.get('name');
      this.loadRecipes();
    });
  }

  loadRecipes(): void {
    this.recipeService.getRecipes().subscribe(data => {
      this.recipes = data;
      if (this.categoryName) {
        // Filter recipes based on the current category name
        this.filteredRecipes = this.recipes.filter(recipe => recipe.category && recipe.category.name === this.categoryName);
      } else {
        this.filteredRecipes = [];
      }
    });
  }
}
