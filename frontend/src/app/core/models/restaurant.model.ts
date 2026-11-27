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