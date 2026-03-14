import { User } from './user.model';

export interface Review {
  id?: number;
  text: string;
  rating: number; // 1 a 5
  createdAt?: string;
  recipeId: number;
  userId: number;
  user?: User;
}