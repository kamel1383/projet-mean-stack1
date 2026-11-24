import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { Dish, DishOptions, DishPayload, RestaurantInfo } from '../models/dish.model';

// Partie Yassmine : appels API pour les plats et les menus
@Injectable({ providedIn: 'root' })
export class DishService {
  private http = inject(HttpClient);

  // Menu public d'un restaurant (plats groupés par catégorie côté composant)
  getByRestaurant(restaurantId: string): Observable<Dish[]> {
    const params = new HttpParams().set('restaurant', restaurantId);
    return this.http.get<Dish[]>(`${API_URL}/dishes`, { params });
  }

  getRestaurant(id: string): Observable<RestaurantInfo> {
    return this.http.get<RestaurantInfo>(`${API_URL}/restaurants/${id}`);
  }

  // Espace restaurateur
  getMine(): Observable<Dish[]> {
    return this.http.get<Dish[]>(`${API_URL}/dishes/mine`);
  }

  getMyOptions(): Observable<DishOptions> {
    return this.http.get<DishOptions>(`${API_URL}/dishes/my-options`);
  }

  create(payload: DishPayload): Observable<Dish> {
    return this.http.post<Dish>(`${API_URL}/dishes`, payload);
  }

  update(id: string, payload: Partial<DishPayload>): Observable<Dish> {
    return this.http.put<Dish>(`${API_URL}/dishes/${id}`, payload);
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/dishes/${id}`);
  }
}
