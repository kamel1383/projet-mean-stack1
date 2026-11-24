// Partie Yassmine : modèles liés aux plats et aux menus
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
  restaurants: OwnerRestaurant[];
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
