/**
 * app.routes.ts — Client-Side Routing Table
 *
 * Maps URL paths to lazy-loaded standalone components (`loadComponent`).
 * Protected routes use `authGuard` (must be logged in) or `roleGuard([...])`
 * (must be logged in AND have one of the specified roles: 'client', 'restaurateur', 'admin').
 */
import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { authGuard } from './core/guards/auth.guard';

// ⚠ Les noms de composants des autres membres (HomeComponent, LoginComponent...)
// sont des hypothèses : adapter les imports si leurs fichiers s'appellent autrement.
export const routes: Routes = [
  // Public routes accessible to everyone
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  // Profile requires any authenticated user
  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'restaurants', loadComponent: () => import('./pages/restaurants/restaurants.component').then(m => m.RestaurantsComponent) },
  { path: 'restaurants/:id', loadComponent: () => import('./pages/restaurant-details/restaurant-details.component').then(m => m.RestaurantDetailsComponent) },

  // --- Espace client ---
  { path: 'cart', loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) },
  {
    path: 'checkout', canActivate: [roleGuard(['client'])],
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
  },
  {
    path: 'my-orders', canActivate: [roleGuard(['client'])],
    loadComponent: () => import('./pages/my-orders/my-orders.component').then(m => m.MyOrdersComponent),
  },

  // --- Espace restaurateur ---
  // Uses a parent layout component (`RestaurateurLayoutComponent`) with nested child routes
  {
    path: 'restaurateur',
    canActivate: [roleGuard(['restaurateur'])],
    loadComponent: () =>
      import('./pages/restaurant-dashboard/restaurateur-layout.component').then(
        (m) => m.RestaurateurLayoutComponent
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/restaurant-dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'manage-orders', loadComponent: () => import('./pages/restaurant-dashboard/manage-orders/manage-orders.component').then(m => m.ManageOrdersComponent) },
      { path: 'manage-dishes', loadComponent: () => import('./pages/restaurant-dashboard/manage-dishes/manage-dishes.component').then(m => m.ManageDishesComponent) },
      { path: 'manage-restaurant', loadComponent: () => import('./pages/restaurant-dashboard/manage-restaurant/manage-restaurant.component').then(m => m.ManageRestaurantComponent) },
    ],
  },
  // Redirection de compatibilité depuis l'ancien chemin
  { path: 'restaurant-dashboard', redirectTo: 'restaurateur/dashboard', pathMatch: 'full' },
  { path: 'restaurant-dashboard/:sub', redirectTo: 'restaurateur/:sub', pathMatch: 'full' },

  // --- Espace administrateur ---
  {
    path: 'admin-dashboard', canActivate: [roleGuard(['admin'])],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'statistics' },
      { path: 'statistics', loadComponent: () => import('./pages/admin-dashboard/statistics/statistics.component').then(m => m.StatisticsComponent) },
      { path: 'users', loadComponent: () => import('./pages/admin-dashboard/users/users.component').then(m => m.UsersComponent) },
      { path: 'restaurateurs', loadComponent: () => import('./pages/admin-dashboard/restaurateurs/restaurateurs.component').then(m => m.RestaurateursComponent) },
      { path: 'restaurants', loadComponent: () => import('./pages/admin-dashboard/restaurants/restaurants.component').then(m => m.RestaurantsComponent) },
    ],
  },

  // Fallback: redirect unknown URLs back to the home page
  { path: '**', redirectTo: '' },
];
