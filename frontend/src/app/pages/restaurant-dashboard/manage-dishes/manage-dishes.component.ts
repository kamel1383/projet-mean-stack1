/**
 * manage-dishes.component.ts — Restaurateur Dish & Menu Management Page (`/restaurateur/manage-dishes`)
 *
 * Loads the restaurateur's dishes (`getMine()`) and available restaurants/categories (`getMyOptions()`).
 * Supports creating, editing, deleting dishes, toggling availability inline, and filtering by name.
 */
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { finalize } from 'rxjs';import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DishService } from '../../../core/services/dish.service';
import { Dish, DishCategory, DishPayload, OwnerRestaurant } from '../../../core/models/dish.model';

const EMPTY: DishPayload = {
  nom: '', description: '', prix: 0, image: '', disponible: true, categorie: '', restaurant: '',
};

@Component({
  selector: 'app-manage-dishes',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './manage-dishes.component.html',
  styleUrl: './manage-dishes.component.css',
})
export class ManageDishesComponent implements OnInit {
  private service = inject(DishService);
private cdr = inject(ChangeDetectorRef);
  dishes: Dish[] = [];
  restaurants: OwnerRestaurant[] = [];
  categories: DishCategory[] = [];

  form: DishPayload = { ...EMPTY };
  editingId: string | null = null;
  showForm = false;

  search = '';
  loading = true;
  saving = false;
  error = '';
  success = '';

  // Loads dropdown options (restaurants & categories) and all dishes owned by this restaurateur
  ngOnInit() {
    this.service.getMyOptions().subscribe({
      next: (o) => {
        this.restaurants = o.restaurants;
        this.categories = o.categories;
        if (o.restaurants.length === 1) this.form.restaurant = o.restaurants[0]._id;
      },
      error: (e) => (this.error = e.error?.message || 'Impossible de charger vos restaurants'),
    });
    this.load();
  }

  load() {
    this.loading = true;
this.service.getMine().pipe(finalize(() => this.cdr.markForCheck())).subscribe({      next: (d) => { this.dishes = d; this.loading = false; },
      error: (e) => { this.error = e.error?.message || 'Impossible de charger les plats'; this.loading = false; },
    });
  }

  // Catégories du restaurant choisi dans le formulaire
  get formCategories(): DishCategory[] {
    return this.categories.filter((c) => c.restaurant === this.form.restaurant);
  }

  get filtered(): Dish[] {
    const q = this.search.trim().toLowerCase();
    return q ? this.dishes.filter((d) => d.nom.toLowerCase().includes(q)) : this.dishes;
  }

  categoryName(d: Dish): string { return typeof d.categorie === 'string' ? '' : d.categorie?.nom; }
  restaurantName(d: Dish): string { return typeof d.restaurant === 'string' ? '' : d.restaurant?.nom; }
  private restaurantId(d: Dish): string { return typeof d.restaurant === 'string' ? d.restaurant : d.restaurant._id; }
  private categoryId(d: Dish): string { return typeof d.categorie === 'string' ? d.categorie : d.categorie._id; }

  onRestaurantChange() { this.form.categorie = ''; }

  openCreate() {
    const only = this.restaurants.length === 1 ? this.restaurants[0]._id : '';
    this.form = { ...EMPTY, restaurant: only };
    this.editingId = null;
    this.showForm = true;
    this.clearMessages();
  }

  openEdit(d: Dish) {
    this.form = {
      nom: d.nom, description: d.description, prix: d.prix, image: d.image, disponible: d.disponible,
      categorie: this.categoryId(d), restaurant: this.restaurantId(d),
    };
    this.editingId = d._id;
    this.showForm = true;
    this.clearMessages();
  }

  cancel() { this.showForm = false; this.editingId = null; }

  // Validates dish form and either creates a new dish or updates an existing one
  save() {
    this.clearMessages();
    if (!this.form.nom.trim()) { this.error = 'Le nom du plat est obligatoire'; return; }
    if (this.form.prix === null || this.form.prix < 0) { this.error = 'Le prix doit être positif'; return; }
    if (!this.form.restaurant || !this.form.categorie) { this.error = 'Choisissez un restaurant et une catégorie'; return; }

    this.saving = true;
    const { restaurant, ...rest } = this.form;
    const call = this.editingId
      ? this.service.update(this.editingId, rest)              // le restaurant n'est pas modifiable
      : this.service.create({ ...rest, restaurant });

call.pipe(finalize(() => this.cdr.markForCheck())).subscribe({      next: () => {
        this.success = this.editingId ? 'Plat modifié' : 'Plat ajouté';
        this.saving = false;
        this.showForm = false;
        this.editingId = null;
        this.load();
      },
      error: (e) => { this.error = e.error?.message || "Enregistrement impossible"; this.saving = false; },
    });
  }

  // Toggles a dish's `disponible` flag inline via PUT /api/dishes/:id
  toggleAvailability(d: Dish) {
    this.clearMessages();
    this.service.update(d._id, { disponible: !d.disponible }).subscribe({
      next: (u) => (d.disponible = u.disponible),
      error: (e) => (this.error = e.error?.message || 'Changement de disponibilité impossible'),
    });
  }

  // Confirms and deletes a dish from the menu, then removes it from the local list
  remove(d: Dish) {
    if (!confirm(`Supprimer « ${d.nom} » ?`)) return;
    this.clearMessages();
    this.service.remove(d._id).subscribe({
      next: () => { this.dishes = this.dishes.filter((x) => x._id !== d._id); this.success = 'Plat supprimé'; },
      error: (e) => (this.error = e.error?.message || 'Suppression impossible'),
    });
  }

  private clearMessages() { this.error = ''; this.success = ''; }
}
