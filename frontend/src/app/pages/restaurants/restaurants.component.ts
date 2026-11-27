/**
 * restaurants.component.ts — Public Restaurant Directory Page (`/restaurants`)
 *
 * Reads optional `search` and `typeCuisine` URL query params, supports filtering
 * by name, cuisine, and open/closed status (`openFilter`), and paginates results
 * from `RestaurantService.getRestaurants()`.
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { Restaurant } from '../../core/models/restaurant.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  RestaurantFilters,
  RestaurantService,
} from '../../core/services/restaurant.service';

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './restaurants.component.html',
  styleUrl: './restaurants.component.css',
})
export class RestaurantsComponent implements OnInit {
  private restaurantService = inject(RestaurantService);
private route = inject(ActivatedRoute);
  restaurants = signal<Restaurant[]>([]);
  searchText = signal('');
  cuisineText = signal('');
  openFilter = signal<'all' | 'true' | 'false'>('all');

  page = signal(1);
  pages = signal(1);
  total = signal(0);
  loading = signal(false);
  errorMessage = signal('');

  // Subscribes to URL query params (from Home page search/cuisine chips) and loads page 1
  ngOnInit(): void {
  this.route.queryParamMap.subscribe((params) => {
    this.searchText.set(params.get('search') ?? '');
    this.cuisineText.set(params.get('typeCuisine') ?? '');
    this.loadRestaurants(1);
  });
}

  // Fetches a paginated list of validated restaurants matching the active filters
  loadRestaurants(page = 1): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const filters: RestaurantFilters = {
      search: this.searchText(),
      typeCuisine: this.cuisineText(),
      page,
      limit: 9,
    };

    if (this.openFilter() !== 'all') {
      filters.isOpen = this.openFilter() === 'true';
    }

    this.restaurantService.getRestaurants(filters).subscribe({
      next: (result) => {
        this.restaurants.set(result.restaurants);
        this.total.set(result.total);
        this.page.set(result.page);
        this.pages.set(result.pages);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger les restaurants.');
        this.loading.set(false);
      },
    });
  }

  updateSearch(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
  }

  updateCuisine(event: Event): void {
    this.cuisineText.set((event.target as HTMLInputElement).value);
  }

  updateOpenFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'all' || value === 'true' || value === 'false') {
      this.openFilter.set(value);
    }
  }

  applyFilters(): void {
    this.loadRestaurants(1);
  }

  previousPage(): void {
    if (this.page() > 1) {
      this.loadRestaurants(this.page() - 1);
    }
  }

  nextPage(): void {
    if (this.page() < this.pages()) {
      this.loadRestaurants(this.page() + 1);
    }
  }
}