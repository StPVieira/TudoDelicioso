import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RecipeService } from '../../services/recipe.service';
import { UserService } from '../../services/user.service';
import { Recipe } from '../../models/recipe.model';
import { Review } from '../../models/review.model';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './recipe-detail.component.html',
  styleUrl: './recipe-detail.component.css'
})
export class RecipeDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  recipeService = inject(RecipeService);
  userService = inject(UserService);
  
  recipe: Recipe | null = null;
  currentUserId: number | null = null;

  // Propriedades para Reviews
  reviews: Review[] = [];
  newReviewText: string = '';
  newReviewRating: number = 0;
  hoveredRating: number = 0;

  // Propriedades para Favoritos
  isFavorite: boolean = false;

  get hasUserReviewed(): boolean {
    if (!this.currentUserId) return false;
    return this.reviews.some(r => r.userId === this.currentUserId);
  }

  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.currentUserId = user ? user.id : null;
      this.checkIfFavorite();
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadRecipeAndReviews(+idParam);
    }
  }

  checkIfFavorite() {
    if (this.recipe && this.currentUserId) {
      this.recipeService.isFavorite(this.recipe.id, this.currentUserId).subscribe(res => {
        this.isFavorite = res.isFavorite;
      });
    }
  }

  loadRecipeAndReviews(id: number) {
    this.recipeService.getRecipe(id).subscribe({
      next: (data) => {
        this.recipe = data;
        // Depois de carregar a receita, verificamos se é favorita
        if (this.currentUserId) {
          this.checkIfFavorite();
        }
      },
      error: (err) => console.error(err)
    });

    this.recipeService.getReviews(id).subscribe({
      next: (data) => this.reviews = data,
      error: (err) => console.error(err)
    });
  }

  toggleFavorite() {
    if (!this.recipe || !this.currentUserId) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.isFavorite) {
      // Remove from favorites
      this.recipeService.removeFromFavorites(this.recipe.id, this.currentUserId).subscribe(() => {
        this.isFavorite = false;
      });
    } else {
      // Add to favorites
      this.recipeService.addToFavorites(this.recipe.id, this.currentUserId).subscribe(() => {
        this.isFavorite = true;
      });
    }
  }

  // Lógica das estrelinhas do form
  setHoverRating(rating: number) {
    this.hoveredRating = rating;
  }

  setRating(rating: number) {
    this.newReviewRating = rating;
  }

  submitReview() {
    if (!this.currentUserId || !this.recipe) return;
    
    if (this.currentUserId === this.recipe.userId) {
      alert('Você não pode avaliar a sua própria receita.');
      return;
    }

    if (this.hasUserReviewed) {
      alert('Você já avaliou esta receita.');
      return;
    }

    if (this.newReviewRating === 0) {
      alert('Por favor, dê uma nota de 1 a 5 estrelas!');
      return;
    }
    if (!this.newReviewText.trim()) {
      alert('Por favor, escreva um comentário!');
      return;
    }

    const review: Review = {
      text: this.newReviewText,
      rating: this.newReviewRating,
      recipeId: this.recipe.id,
      userId: this.currentUserId
    };

    this.recipeService.addReview(this.recipe.id, review).subscribe({
      next: (savedReview) => {
        // Adiciona a nova review no topo da lista
        this.reviews.unshift(savedReview);
        // Limpa o formulário
        this.newReviewText = '';
        this.newReviewRating = 0;
        this.hoveredRating = 0;
      },
      error: (err) => {
        console.error('Erro ao salvar review', err);
        // Tenta exibir a mensagem de erro que vem do backend, caso exista.
        if (err.error && typeof err.error === 'string') {
           alert(err.error);
        } else {
           alert('Erro ao enviar avaliação. Tente novamente.');
        }
      }
    });
  }

  deleteRecipe() {
    if (this.recipe && confirm('Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita.')) {
      this.recipeService.deleteRecipe(this.recipe.id).subscribe({
        next: () => {
          alert('Receita excluída com sucesso!');
          this.router.navigate(['/']); // Retorna para a página inicial
        },
        error: (err) => {
          console.error('Erro ao excluir', err);
          alert('Erro ao excluir a receita.');
        }
      });
    }
  }

  get averageRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }
}
