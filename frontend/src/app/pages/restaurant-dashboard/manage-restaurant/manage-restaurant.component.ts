import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Restaurant } from '../../../core/models/restaurant.model';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { RestaurateurContextService } from '../../../core/services/restaurateur-context.service';
import { Category, CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-manage-restaurant',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './manage-restaurant.component.html',
  styleUrl: './manage-restaurant.component.css',
})
export class ManageRestaurantComponent implements OnInit {
  private restaurantService = inject(RestaurantService);
  private ctx = inject(RestaurateurContextService);
  private categoryService = inject(CategoryService);

  restaurants = this.ctx.restaurants;
  selectedRestaurant = signal<Restaurant | null>(null);
  categories = signal<Category[]>([]);

  loading = this.ctx.loading;
  saving = signal(false);
  error = signal('');
  success = signal('');

  form = {
    nom: '',
    description: '',
    adresse: '',
    typeCuisine: '',
    image: '',
    fraisLivraison: 0,
    horaires: '',
    isOpen: true,
  };

  catForm = {
    nom: '',
    description: '',
  };
  editingCatId = signal<string | null>(null);

  constructor() {
    // Synchronise le formulaire avec le restaurant sélectionné dans le sélecteur global
    effect(() => {
      const resto = this.ctx.selectedRestaurant();
      if (resto) {
        this.selectRestaurant(resto);
      }
    });
  }

  ngOnInit(): void {
    this.ctx.loadMyRestaurants();
  }

  selectRestaurant(resto: Restaurant | null): void {
    this.selectedRestaurant.set(resto);
    if (resto) {
      this.form = {
        nom: resto.nom,
        description: resto.description,
        adresse: resto.adresse,
        typeCuisine: resto.typeCuisine,
        image: resto.image || '',
        fraisLivraison: resto.fraisLivraison,
        horaires: resto.horaires,
        isOpen: resto.isOpen,
      };
      this.loadCategories(resto._id);
    } else {
      this.form = {
        nom: '',
        description: '',
        adresse: '',
        typeCuisine: '',
        image: '',
        fraisLivraison: 0,
        horaires: '',
        isOpen: true,
      };
      this.categories.set([]);
    }
  }

  loadCategories(restaurantId: string): void {
    this.categoryService.getByRestaurant(restaurantId).subscribe({
      next: ({ categories }) => this.categories.set(categories),
      error: () => this.categories.set([]),
    });
  }

  saveRestaurant(): void {
    if (!this.form.nom.trim() || !this.form.description.trim() || !this.form.adresse.trim() || !this.form.typeCuisine.trim() || !this.form.horaires.trim()) {
      this.error.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    const current = this.selectedRestaurant();
    const req$ = current
      ? this.restaurantService.updateRestaurant(current._id, this.form)
      : this.restaurantService.createRestaurant(this.form);

    req$.subscribe({
      next: (saved) => {
        if (current) {
          this.ctx.updateLocalRestaurant(saved);
          this.success.set(`Restaurant "${saved.nom}" mis à jour.`);
        } else {
          this.ctx.loadMyRestaurants(true);
          this.success.set(`Restaurant "${saved.nom}" créé (en attente de validation admin).`);
        }
        this.selectedRestaurant.set(saved);
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de l’enregistrement.');
        this.saving.set(false);
      },
    });
  }

  editCategory(cat: Category): void {
    this.editingCatId.set(cat._id);
    this.catForm = { nom: cat.nom, description: cat.description || '' };
  }

  resetCatForm(): void {
    this.editingCatId.set(null);
    this.catForm = { nom: '', description: '' };
  }

  saveCategory(): void {
    const resto = this.selectedRestaurant();
    if (!resto || !this.catForm.nom.trim()) return;

    const editId = this.editingCatId();
    const req$ = editId
      ? this.categoryService.updateCategory(editId, this.catForm)
      : this.categoryService.createCategory({
          nom: this.catForm.nom,
          description: this.catForm.description,
          restaurantId: resto._id,
        });

    req$.subscribe({
      next: (saved) => {
        if (editId) {
          this.categories.update((list) => list.map((c) => (c._id === saved._id ? saved : c)));
        } else {
          this.categories.update((list) => [...list, saved]);
        }
        this.resetCatForm();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la sauvegarde de la catégorie.');
      },
    });
  }

  deleteCategory(cat: Category): void {
    if (!confirm(`Supprimer la catégorie "${cat.nom}" ?`)) return;
    this.categoryService.deleteCategory(cat._id).subscribe({
      next: () => {
        this.categories.update((list) => list.filter((c) => c._id !== cat._id));
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la suppression de la catégorie.');
      },
    });
  }
}
