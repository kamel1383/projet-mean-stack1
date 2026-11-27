/**
 * home.component.ts — Public Landing Page Component (`/`)
 *
 * Fetches validated restaurants on load, extracts unique cuisine types for quick-filter
 * chips, displays up to 4 featured restaurants, and navigates to `/restaurants` with
 * query parameters when the user searches or clicks a cuisine chip.
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Restaurant } from '../../core/models/restaurant.model';
import { RestaurantService } from '../../core/services/restaurant.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private restaurantService = inject(RestaurantService);
  private router = inject(Router);

  searchText = signal('');
  cuisines = signal<string[]>([]);
  featuredRestaurants = signal<Restaurant[]>([]);
  loading = signal(true);

  // Loads validated restaurants to extract unique cuisine chips and pick 4 featured cards
  ngOnInit(): void {
    this.restaurantService.getRestaurants({ page: 1, limit: 50 }).subscribe({
      next: (result) => {
        const restaurants = result.restaurants;

        this.cuisines.set(
          [...new Set(restaurants.map((restaurant) => restaurant.typeCuisine))]
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b)),
        );

        this.featuredRestaurants.set(restaurants.slice(0, 4));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  updateSearch(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
  }

  // Navigates to the restaurants directory with the search query parameter
  searchRestaurants(event: Event): void {
    event.preventDefault();

    this.router.navigate(['/restaurants'], {
      queryParams: { search: this.searchText() || null },
    });
  }

  // Navigates to the restaurants directory pre-filtered by the clicked cuisine chip
  chooseCuisine(cuisine: string): void {
    this.router.navigate(['/restaurants'], {
      queryParams: { typeCuisine: cuisine },
    });
  }

  showRestaurants(): void {
    this.router.navigate(['/restaurants']);
  }
}