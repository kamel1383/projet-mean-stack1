/**
 * restaurateur-layout.component.ts — Restaurateur Workspace Shell (`/restaurateur/*`)
 *
 * Loads the logged-in restaurateur's restaurants into `RestaurateurContextService` on init
 * and displays the top navigation bar + active restaurant selector above `<router-outlet>`.
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RestaurateurContextService } from '../../core/services/restaurateur-context.service';

/**
 * Layout principal de l'espace restaurateur (/restaurateur/*).
 * Affiche la barre de navigation interne et, si le restaurateur possède
 * plusieurs restaurants, un sélecteur de restaurant en haut de l'espace.
 */
@Component({
  selector: 'app-restaurateur-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './restaurateur-layout.component.html',
  styleUrl: './restaurateur-layout.component.css',
})
export class RestaurateurLayoutComponent implements OnInit {
  ctx = inject(RestaurateurContextService);

  ngOnInit(): void {
    this.ctx.loadMyRestaurants(true);
  }

  onRestaurantChange(id: string): void {
    this.ctx.selectRestaurant(id);
  }
}
