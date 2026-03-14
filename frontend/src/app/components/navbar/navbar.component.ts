import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Category } from '../../models/category.model';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  categories: Category[] = [];
  private recipeService = inject(RecipeService);

  ngOnInit(): void {
    this.recipeService.getCategories().subscribe(data => {
      // Filter out unwanted categories like "Canais Especiais" if they come from the API
      this.categories = data.filter(c => c.name !== 'Canais Especiais' && c.name !== 'Notícias');
    });
  }
}