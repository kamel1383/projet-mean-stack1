import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';

export interface Category {
  _id: string;
  nom: string;
  description: string;
  restaurant: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);

  getByRestaurant(restaurantId: string): Observable<{ categories: Category[] }> {
    return this.http.get<{ categories: Category[] }>(
      `${API_URL}/categories/restaurant/${restaurantId}`,
    );
  }

  createCategory(payload: {
    nom: string;
    description?: string;
    restaurantId: string;
  }): Observable<Category> {
    return this.http.post<Category>(`${API_URL}/categories`, payload);
  }

  updateCategory(
    categoryId: string,
    payload: { nom?: string; description?: string },
  ): Observable<Category> {
    return this.http.put<Category>(`${API_URL}/categories/${categoryId}`, payload);
  }
}
