import { Category } from './category.model';
import { User } from './user.model';

export interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  imageUrl?: string;
  categoryId: number;
  category?: Category;
  userId: number;
  user?: User;
}