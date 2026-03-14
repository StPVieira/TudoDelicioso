import { Component, OnInit, inject } from '@angular/core';
import { RecipeCardComponent } from '../../components/recipe-card/recipe-card.component';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  recipes: Recipe[] = [];
  recipeService = inject(RecipeService);

  ngOnInit(): void {
    this.recipeService.getRecipes().subscribe({
      next: (data) => this.recipes = data,
      error: (err) => console.error(err)
    });
  }
}
