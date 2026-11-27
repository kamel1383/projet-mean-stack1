import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { AdminStats, RestaurantStats } from '../models/stats.model';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private http = inject(HttpClient);

  getRestaurantStats(restaurantId?: string): Observable<RestaurantStats> {
    let params = new HttpParams();
    if (restaurantId) {
      params = params.set('restaurantId', restaurantId);
    }
    return this.http.get<RestaurantStats>(`${API_URL}/stats/restaurant`, { params });
  }

  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${API_URL}/stats/admin`);
  }
}
