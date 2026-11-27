/**
 * dish.model.ts — TypeScript Interfaces for Dishes, Categories, and Restaurant Menu Info
 *
 * Mirrors the Mongoose schemas (`Dish`, `Category`, `Restaurant`) so Angular components
 * and services get compile-time type checking on API payloads and responses.
 */
// Partie Yassmine : modèles liés aux plats et aux menus
import type { Restaurant } from './restaurant.model';
export interface DishCategory {
  _id: string;
  nom: string;
  restaurant?: string;
}

export interface Dish {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  image: string;
  disponible: boolean;
  categorie: DishCategory | string;
  restaurant: string | { _id: string; nom: string };
}

export interface DishPayload {
  nom: string;
  description: string;
  prix: number;
  image: string;
  disponible: boolean;
  categorie: string;
  restaurant?: string; // obligatoire à la création, ignoré à la modification
}

export interface OwnerRestaurant { _id: string; nom: string; }

export interface DishOptions {
restaurants: Restaurant[];
  categories: DishCategory[];
}

// Restaurant tel que renvoyé par GET /api/restaurants/:id (partie Hiba)
export interface RestaurantInfo {
  _id: string;
  nom: string;
  description?: string;
  adresse?: string;
  typeCuisine?: string;
  image?: string;
  fraisLivraison: number;
  horaires?: string;
  isOpen?: boolean;
}
