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

  searchRestaurants(event: Event): void {
    event.preventDefault();

    this.router.navigate(['/restaurants'], {
      queryParams: { search: this.searchText() || null },
    });
  }

  chooseCuisine(cuisine: string): void {
    this.router.navigate(['/restaurants'], {
      queryParams: { typeCuisine: cuisine },
    });
  }

  showRestaurants(): void {
    this.router.navigate(['/restaurants']);
  }
}