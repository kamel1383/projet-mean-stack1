/**
 * category.service.ts — Menu Category HTTP Service
 *
 * Communicates with `/api/categories` on the Express backend to fetch categories
 * for a restaurant and let restaurateurs create, update, or delete categories.
 */
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

  // Fetches all menu categories for a given restaurant
  getByRestaurant(restaurantId: string): Observable<{ categories: Category[] }> {
    return this.http.get<{ categories: Category[] }>(
      `${API_URL}/categories/restaurant/${restaurantId}`,
    );
  }

  // Creates a new menu category for one of the restaurateur's restaurants
  createCategory(payload: {
    nom: string;
    description?: string;
    restaurantId: string;
  }): Observable<Category> {
    return this.http.post<Category>(`${API_URL}/categories`, payload);
  }

  // Updates an existing category's name or description
  updateCategory(
    categoryId: string,
    payload: { nom?: string; description?: string },
  ): Observable<Category> {
    return this.http.put<Category>(`${API_URL}/categories/${categoryId}`, payload);
  }

  // Deletes a category by its ID
  deleteCategory(categoryId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/categories/${categoryId}`);
  }
}
