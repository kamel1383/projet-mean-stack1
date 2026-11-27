import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UserService,
  RestaurateurWithRestaurants,
} from '../../../core/services/user.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { Restaurant } from '../../../core/models/restaurant.model';

/**
 * Page d'administration des restaurateurs (/admin-dashboard/restaurateurs).
 * Permet de créer un restaurateur + son restaurant en une fois, copier ses identifiants,
 * modifier ses infos, réinitialiser son mot de passe, activer/désactiver son compte,
 * lui attribuer un nouveau restaurant, changer le propriétaire d'un restaurant,
 * et valider/suspendre ses restaurants.
 */
@Component({
  selector: 'app-admin-restaurateurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurateurs.component.html',
  styleUrl: './restaurateurs.component.css',
})
export class RestaurateursComponent implements OnInit {
  private userService = inject(UserService);
  private restaurantService = inject(RestaurantService);

  restaurateurs = signal<RestaurateurWithRestaurants[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  search = '';
  page = 1;
  pages = 1;
  total = 0;

  // Affichage du formulaire "Nouveau restaurateur"
  showCreateForm = signal(false);
  createForm = {
    user: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      password: '',
    },
    restaurant: {
      nom: '',
      description: '',
      adresse: '',
      typeCuisine: '',
      image: '',
      horaires: '11h00 - 23h00',
      fraisLivraison: 3,
    },
  };

  // Identifiants affichés après création ou réinitialisation pour copie
  createdCredentials = signal<{ email: string; password: string } | null>(null);
  copied = signal(false);

  // Édition d'un restaurateur existant
  editingRestaurateur = signal<RestaurateurWithRestaurants | null>(null);
  editForm = { nom: '', prenom: '', email: '', telephone: '' };

  // Réinitialisation du mot de passe
  resetPasswordTarget = signal<RestaurateurWithRestaurants | null>(null);
  newPassword = '';

  // Attribution d'un nouveau restaurant à un restaurateur existant
  assignRestoTarget = signal<RestaurateurWithRestaurants | null>(null);
  assignRestoForm = {
    nom: '',
    description: '',
    adresse: '',
    typeCuisine: '',
    image: '',
    horaires: '11h00 - 23h00',
    fraisLivraison: 3,
  };

  // Changement de propriétaire d'un restaurant
  changeOwnerTarget = signal<Restaurant | null>(null);
  newOwnerId = '';

  ngOnInit(): void {
    this.loadRestaurateurs();
  }

  loadRestaurateurs(): void {
    this.loading.set(true);
    this.error.set('');
    this.userService
      .getRestaurateurs({ search: this.search.trim() || undefined, page: this.page, limit: 10 })
      .subscribe({
        next: (res) => {
          this.restaurateurs.set(res.restaurateurs);
          this.total = res.total;
          this.pages = res.pages;
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors du chargement des restaurateurs.');
          this.loading.set(false);
        },
      });
  }

  onSearch(): void {
    this.page = 1;
    this.loadRestaurateurs();
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.pages) {
      this.page = p;
      this.loadRestaurateurs();
    }
  }

  toggleCreateForm(): void {
    this.showCreateForm.update((v) => !v);
    this.error.set('');
    this.success.set('');
  }

  submitCreate(): void {
    this.saving.set(true);
    this.error.set('');
    this.success.set('');
    this.createdCredentials.set(null);

    this.userService.createRestaurateurWithRestaurant(this.createForm).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.showCreateForm.set(false);
        this.createdCredentials.set(res.credentials);
        this.copied.set(false);
        this.success.set(res.message);
        this.resetCreateForm();
        this.loadRestaurateurs();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.message || 'Échec de la création du restaurateur.');
      },
    });
  }

  private resetCreateForm(): void {
    this.createForm = {
      user: { nom: '', prenom: '', email: '', telephone: '', password: '' },
      restaurant: {
        nom: '',
        description: '',
        adresse: '',
        typeCuisine: '',
        image: '',
        horaires: '11h00 - 23h00',
        fraisLivraison: 3,
      },
    };
  }

  copyCredentials(): void {
    const creds = this.createdCredentials();
    if (!creds) return;
    const text = `Email: ${creds.email}\nMot de passe: ${creds.password}`;
    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    });
  }

  // --- Modifier un restaurateur ---
  openEdit(r: RestaurateurWithRestaurants): void {
    this.editingRestaurateur.set(r);
    this.editForm = {
      nom: r.nom,
      prenom: r.prenom,
      email: r.email,
      telephone: r.telephone,
    };
    this.error.set('');
    this.success.set('');
  }

  submitEdit(): void {
    const target = this.editingRestaurateur();
    if (!target) return;
    this.saving.set(true);
    this.userService.updateRestaurateur(target._id, this.editForm).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.editingRestaurateur.set(null);
        this.success.set(res.message);
        this.loadRestaurateurs();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.message || 'Erreur lors de la modification.');
      },
    });
  }

  // --- Réinitialiser mot de passe ---
  openResetPassword(r: RestaurateurWithRestaurants): void {
    this.resetPasswordTarget.set(r);
    this.newPassword = '';
    this.error.set('');
    this.success.set('');
  }

  submitResetPassword(): void {
    const target = this.resetPasswordTarget();
    if (!target) return;
    this.saving.set(true);
    this.userService.resetRestaurateurPassword(target._id, this.newPassword).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.resetPasswordTarget.set(null);
        this.createdCredentials.set(res.credentials);
        this.copied.set(false);
        this.success.set(res.message);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.message || 'Erreur lors de la réinitialisation.');
      },
    });
  }

  // --- Activer / Désactiver compte ---
  toggleAccountStatus(r: RestaurateurWithRestaurants): void {
    this.userService.updateUserStatus(r._id, !r.isActive).subscribe({
      next: (res) => {
        this.success.set(res.message);
        this.loadRestaurateurs();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Impossible de modifier le statut du compte.');
      },
    });
  }

  // --- Attribuer un nouveau restaurant ---
  openAssignRestaurant(r: RestaurateurWithRestaurants): void {
    this.assignRestoTarget.set(r);
    this.assignRestoForm = {
      nom: '',
      description: '',
      adresse: '',
      typeCuisine: '',
      image: '',
      horaires: '11h00 - 23h00',
      fraisLivraison: 3,
    };
    this.error.set('');
    this.success.set('');
  }

  submitAssignRestaurant(): void {
    const target = this.assignRestoTarget();
    if (!target) return;
    this.saving.set(true);
    this.restaurantService
      .createRestaurantForOwner({ ownerId: target._id, ...this.assignRestoForm })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.assignRestoTarget.set(null);
          this.success.set(`Restaurant attribué à ${target.prenom} ${target.nom}.`);
          this.loadRestaurateurs();
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err.error?.message || 'Erreur lors de l\'attribution du restaurant.');
        },
      });
  }

  // --- Valider / Suspendre un restaurant ---
  toggleRestaurantStatus(resto: Restaurant): void {
    const nextStatut = resto.statut === 'valide' ? 'suspendu' : 'valide';
    this.restaurantService.updateRestaurantStatus(resto._id, nextStatut).subscribe({
      next: () => {
        this.success.set(`Restaurant "${resto.nom}" passé à "${nextStatut}".`);
        this.loadRestaurateurs();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors du changement de statut.');
      },
    });
  }

  // --- Changer le propriétaire d'un restaurant ---
  openChangeOwner(resto: Restaurant): void {
    this.changeOwnerTarget.set(resto);
    this.newOwnerId = typeof resto.owner === 'string' ? resto.owner : resto.owner?._id || '';
    this.error.set('');
    this.success.set('');
  }

  submitChangeOwner(): void {
    const resto = this.changeOwnerTarget();
    if (!resto || !this.newOwnerId) return;
    this.saving.set(true);
    this.restaurantService.changeRestaurantOwner(resto._id, this.newOwnerId).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.changeOwnerTarget.set(null);
        this.success.set(res.message);
        this.loadRestaurateurs();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.message || 'Erreur lors du changement de propriétaire.');
      },
    });
  }
}
