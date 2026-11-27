import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { DishService } from '../../core/services/dish.service';
// Service de Adem : doit exposer addItem(dish, restaurant) — voir README
import { CartService } from '../../core/services/cart.service';
import { Dish, DishCategory, RestaurantInfo } from '../../core/models/dish.model';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
interface MenuSection { id: string; nom: string; dishes: Dish[]; }

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './restaurant-details.component.html',
  styleUrl: './restaurant-details.component.css',
})
export class RestaurantDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dishService = inject(DishService);
  private cart = inject(CartService);
  private cdr = inject(ChangeDetectorRef);

  restaurant?: RestaurantInfo;
  sections: MenuSection[] = [];
  activeSection = '';        // '' = toutes les catégories
  loading = true;
  error = '';
  notice = '';
  private noticeTimer?: ReturnType<typeof setTimeout>;

 ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');

  if (!id) {
    this.error = 'Restaurant introuvable';
    this.loading = false;
    return;
  }

  forkJoin({
    restaurant: this.dishService.getRestaurant(id),
    dishes: this.dishService.getByRestaurant(id),
  }).subscribe({
    next: ({ restaurant, dishes }) => {
      this.restaurant = restaurant;
      this.sections = this.groupByCategory(dishes);
      this.loading = false;
      this.cdr.markForCheck();
    },
    error: (err) => {
      this.error = err.error?.message || 'Impossible de charger le menu.';
      this.loading = false;
      this.cdr.markForCheck();
    },
  });
}

  private groupByCategory(dishes: Dish[]): MenuSection[] {
    const map = new Map<string, MenuSection>();
    for (const d of dishes) {
      const cat = d.categorie as DishCategory;
      const id = typeof d.categorie === 'string' ? d.categorie : cat._id;
      const nom = typeof d.categorie === 'string' ? 'Autres' : cat.nom;
      if (!map.has(id)) map.set(id, { id, nom, dishes: [] });
      map.get(id)!.dishes.push(d);
    }
    return [...map.values()].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  }

  get visibleSections(): MenuSection[] {
    return this.activeSection ? this.sections.filter((s) => s.id === this.activeSection) : this.sections;
  }

  select(id: string) { this.activeSection = id; }

  // Règle métier : un plat indisponible ne peut pas être ajouté au panier
  addToCart(dish: Dish): void {
    const restaurant = this.restaurant;
    if (!restaurant || !dish.disponible) return;

    const sameRestaurant = this.cart.addToCart(dish, {
      _id: restaurant._id,
      nom: restaurant.nom,
      fraisLivraison: restaurant.fraisLivraison,
    });

    this.notice = sameRestaurant
      ? `« ${dish.nom} » ajouté au panier`
      : `Panier précédent remplacé. « ${dish.nom} » ajouté chez ${restaurant.nom}.`;

    clearTimeout(this.noticeTimer);
    this.noticeTimer = setTimeout(() => (this.notice = ''), 2500);
  }
}
