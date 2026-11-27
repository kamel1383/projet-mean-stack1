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

  createOrder(orderData: CreateOrderPayload): Observable<Order> {
    return this.http.post<Order>(`${API_URL}/orders`, orderData);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${API_URL}/orders/my-orders`);
  }
}
