import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { Order, OrderStatus, OrdersPage } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class RestaurantOrderService {
  private http = inject(HttpClient);

  getOrders(opts: { statut?: string; page?: number; limit?: number } = {}): Observable<OrdersPage> {
    let params = new HttpParams();
    if (opts.statut) params = params.set('statut', opts.statut);
    if (opts.page) params = params.set('page', opts.page);
    if (opts.limit) params = params.set('limit', opts.limit);
    return this.http.get<OrdersPage>(`${API_URL}/orders/restaurant`, { params });
  }

  updateStatus(id: string, statut: OrderStatus): Observable<Order> {
    return this.http.put<Order>(`${API_URL}/orders/${id}/status`, { statut });
  }
}
