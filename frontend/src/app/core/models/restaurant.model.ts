/**
 * restaurant.model.ts — TypeScript Interface for Restaurant Documents
 *
 * Represents a restaurant returned by `/api/restaurants`, including its moderation
 * status (`'en_attente' | 'valide' | 'suspendu'`) and open/closed flag (`isOpen`).
 */
export type RestaurantStatut = 'en_attente' | 'valide' | 'suspendu';

export interface Restaurant {
  _id: string;
  nom: string;
  description: string;
  adresse: string;
  typeCuisine: string;
  image: string;
  fraisLivraison: number;
  horaires: string;
  isOpen: boolean;
  owner: string | { _id: string };
  statut: RestaurantStatut;
  createdAt?: string;
  updatedAt?: string;
}