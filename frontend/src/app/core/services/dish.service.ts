import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { Restaurant } from '../models/restaurant.model';

export interface Dish {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  image: string;
  categorie: string;
  restaurant: string | { _id: string; nom: string };
  disponible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MyDishesResponse {
  restaurants: Restaurant[];
  dishes: Dish[];
}

export interface DishPayload {
  nom: string;
  description?: string;
  prix: number;
  image?: string;
  categorie?: string;
  disponible?: boolean;
  restaurant?: string;
}

@Injectable({ providedIn: 'root' })
export class DishService {
  private http = inject(HttpClient);

  getByRestaurant(restaurantId: string): Observable<Dish[]> {
    return this.http.get<Dish[]>(`${API_URL}/dishes/restaurant/${restaurantId}`);
  }

  getMyDishes(): Observable<MyDishesResponse> {
    return this.http.get<MyDishesResponse>(`${API_URL}/dishes/my`);
  }

  createDish(payload: DishPayload): Observable<Dish> {
    return this.http.post<Dish>(`${API_URL}/dishes`, payload);
  }

  updateDish(id: string, payload: Partial<DishPayload>): Observable<Dish> {
    return this.http.put<Dish>(`${API_URL}/dishes/${id}`, payload);
  }

  toggleAvailability(id: string): Observable<Dish> {
    return this.http.patch<Dish>(`${API_URL}/dishes/${id}/availability`, {});
  }

  deleteDish(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/dishes/${id}`);
  }
}
