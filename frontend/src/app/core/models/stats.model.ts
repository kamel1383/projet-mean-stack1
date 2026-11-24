export interface RestaurantStats {
  totalOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  revenue: number;
  topDishes: { _id: string; nom: string; quantite: number }[];
}

export interface AdminStats {
  clients: number;
  restaurants: number;
  orders: number;
  revenue: number;
  ordersByStatus: { statut: string; count: number }[];
}
