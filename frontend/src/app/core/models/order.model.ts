/**
 * order.model.ts — TypeScript Interfaces & Status Constants for Orders
 *
 * Defines the shape of `Order`, `OrderItem`, paginated `OrdersPage`,
 * UI display labels (`STATUS_LABELS`), Bootstrap badge classes (`STATUS_BADGE`),
 * and allowed status transitions (`NEXT_STATUS`) matching the backend state machine.
 */
export type OrderStatus =
  | 'en_attente' | 'acceptee' | 'en_preparation'
  | 'en_livraison' | 'livree' | 'annulee';

export interface OrderItem {
  plat: string;
  nom: string;
  quantite: number;
  prixUnitaire: number;
}

export interface Order {
  _id: string;
  client: { _id: string; nom: string; prenom: string; telephone?: string; email?: string };
  restaurant: { _id: string; nom: string };
  articles: OrderItem[];
  adresseLivraison: string;
  sousTotal: number;
  fraisLivraison: number;
  total: number;
  modePaiement: string;
  statut: OrderStatus;
  remarque?: string;
  createdAt: string;
}

export interface OrdersPage {
  orders: Order[];
  total: number;
  page: number;
  pages: number;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente: 'En attente',
  acceptee: 'Acceptée',
  en_preparation: 'En préparation',
  en_livraison: 'En livraison',
  livree: 'Livrée',
  annulee: 'Annulée',
};

export const STATUS_BADGE: Record<OrderStatus, string> = {
  en_attente: 'bg-warning text-dark',
  acceptee: 'bg-info text-dark',
  en_preparation: 'bg-primary',
  en_livraison: 'bg-secondary',
  livree: 'bg-success',
  annulee: 'bg-danger',
};

// Même cycle de vie que le backend (le serveur reste l'autorité)
export const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  en_attente: ['acceptee', 'annulee'],
  acceptee: ['en_preparation', 'annulee'],
  en_preparation: ['en_livraison', 'annulee'],
  en_livraison: ['livree'],
  livree: [],
  annulee: [],
};
