import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './recipe-form.component.html',
  styleUrl: './recipe-form.component.css'
})
export class RecipeFormComponent implements OnInit {
  recipe: Recipe = {
    id: 0,
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    imageUrl: '',
    categoryId: 0, // Default to 0 (unselected)
    userId: 0
  };

  categories: Category[] = [];
  isEditMode = false;
  recipeService = inject(RecipeService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  ngOnInit() {
    // Buscar categorias
    this.recipeService.getCategories().subscribe(data => {
      this.categories = data;
    });

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.recipe.userId = user.id;
    } else {
      alert('Você precisa estar logado para criar uma receita.');
      this.router.navigate(['/login']);
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.recipeService.getRecipe(+id).subscribe(r => {
        this.recipe = r;
      });
    }
  }

  onSubmit(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    if (this.isEditMode) {
      this.recipeService.updateRecipe(this.recipe.id, this.recipe).subscribe(() => {
        alert('Receita atualizada!');
        this.router.navigate(['/']);
      });
    } else {
      this.recipeService.createRecipe(this.recipe).subscribe(() => {
        alert('Receita criada!');
        this.router.navigate(['/']);
      });
    }
  }
}
