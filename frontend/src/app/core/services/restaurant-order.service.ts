/**
 * restaurant-order.service.ts — Restaurateur Order Management HTTP Service
 *
 * Communicates with `/api/orders/restaurant` and `/api/orders/:id/status`
 * so restaurateurs can view paginated incoming orders and update their status.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { Order, OrderStatus, OrdersPage } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class RestaurantOrderService {
  private http = inject(HttpClient);

  // Fetches paginated incoming orders for the restaurateur's restaurant(s)
  getOrders(opts: { statut?: string; restaurantId?: string; page?: number; limit?: number } = {}): Observable<OrdersPage> {
    let params = new HttpParams();
    if (opts.statut) params = params.set('statut', opts.statut);
    if (opts.restaurantId) params = params.set('restaurantId', opts.restaurantId);
    if (opts.page) params = params.set('page', opts.page);
    if (opts.limit) params = params.set('limit', opts.limit);
    return this.http.get<OrdersPage>(`${API_URL}/orders/restaurant`, { params });
  }

  // Updates an order's status (backend enforces valid state transitions)
  updateStatus(id: string, statut: OrderStatus): Observable<Order> {
    return this.http.put<Order>(`${API_URL}/orders/${id}/status`, { statut });
  }
}
