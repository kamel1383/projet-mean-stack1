/**
 * order.service.ts — Client Order HTTP Service
 *
 * Sends `POST /api/orders` to place a new order from the Checkout page,
 * and `GET /api/orders/my-orders` to load the logged-in customer's order history.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { Order } from '../models/order.model';

export interface CreateOrderPayload {
  restaurant: string;
  articles: { plat: string; quantite: number }[];
  adresseLivraison: string;
  modePaiement?: string;
  remarque?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);

  // Sends a new customer order to POST /api/orders
  createOrder(orderData: CreateOrderPayload): Observable<Order> {
    return this.http.post<Order>(`${API_URL}/orders`, orderData);
  }

  // Retrieves all orders placed by the currently logged-in client
  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${API_URL}/orders/my-orders`);
  }
}
