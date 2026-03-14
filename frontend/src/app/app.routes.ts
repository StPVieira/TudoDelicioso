import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RecipeFormComponent } from './pages/recipe-form/recipe-form.component';
import { UserFormComponent } from './pages/user-form/user-form.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RecipeDetailComponent } from './pages/recipe-detail/recipe-detail.component';
import { CategoryComponent } from './pages/category/category.component';
import { SearchResultsComponent } from './pages/search-results/search-results.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search/:query', component: SearchResultsComponent },
  { path: 'category/:name', component: CategoryComponent },
  { path: 'recipe/new', component: RecipeFormComponent },
  { path: 'recipe/edit/:id', component: RecipeFormComponent },
  { path: 'recipe/:id', component: RecipeDetailComponent },
  { path: 'login', component: UserFormComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '' }
];
