import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';
import { Router } from '@angular/router';
import { RecipeCardComponent } from '../../components/recipe-card/recipe-card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RecipeCardComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  userService = inject(UserService);
  recipeService = inject(RecipeService);
  router = inject(Router);

  myRecipes: Recipe[] = [];
  savedRecipes: Recipe[] = []; // Novas receitas favoritas
  activeTab: 'my' | 'saved' = 'my';

  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      // Carregar as próprias receitas
      this.recipeService.getRecipes().subscribe(recipes => {
        this.myRecipes = recipes.filter(r => r.userId === user.id);
      });

      // Carregar as receitas favoritas salvas do backend
      this.userService.getFavorites(user.id).subscribe(favorites => {
        this.savedRecipes = favorites;
      });
    });
  }

  logout() {
    this.userService.setCurrentUser(null);
    this.router.navigate(['/']);
  }
}
