/**
 * navbar.component.ts — Top Navigation Bar Component
 *
 * Reads reactive state from `AuthService` (to show login/register vs. role-specific
 * dashboard links and user profile/logout) and `CartService` (to show the live cart item count).
 */
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);

  get cartCount(): number {
    return this.cartService.getItemCount();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
