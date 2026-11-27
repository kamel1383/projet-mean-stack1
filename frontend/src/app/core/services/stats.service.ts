/**
 * stats.service.ts — Dashboard Statistics HTTP Service
 *
 * Fetches aggregated KPIs from `/api/stats/restaurant` (for restaurateurs)
 * and `/api/stats/admin` (for platform administrators).
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { AdminStats, RestaurantStats } from '../models/stats.model';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private http = inject(HttpClient);

  // Fetches KPIs and top dishes for the restaurateur (optionally scoped to one restaurantId)
  getRestaurantStats(restaurantId?: string): Observable<RestaurantStats> {
    let params = new HttpParams();
    if (restaurantId) {
      params = params.set('restaurantId', restaurantId);
    }
    return this.http.get<RestaurantStats>(`${API_URL}/stats/restaurant`, { params });
  }

  // Fetches platform-wide KPIs and order status breakdown for the admin dashboard
  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${API_URL}/stats/admin`);
  }
}
