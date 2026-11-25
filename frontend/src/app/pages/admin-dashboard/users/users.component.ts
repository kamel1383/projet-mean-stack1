import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  users = signal<User[]>([]);
  total = signal(0);
  page = signal(1);
  pages = signal(1);
  limit = 10;
  search = '';
  roleFilter = '';

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  selectedUser = signal<User | null>(null);
  targetNewStatus = signal(false);
  isUpdatingStatus = signal(false);

  get currentAdminId(): string | undefined {
    return this.authService.currentUser()?._id;
  }

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService
      .getUsers({
        search: this.search,
        role: this.roleFilter || undefined,
        page: this.page(),
        limit: this.limit,
      })
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.users.set(res.users);
          this.total.set(res.total);
          this.page.set(res.page);
          this.pages.set(res.pages);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            err.error?.message || 'Erreur lors de la récupération des utilisateurs.'
          );
        },
      });
  }

  onSearch(): void {
    this.page.set(1);
    this.fetchUsers();
  }

  onRoleChange(): void {
    this.page.set(1);
    this.fetchUsers();
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.pages() && p !== this.page()) {
      this.page.set(p);
      this.fetchUsers();
    }
  }

  openConfirmStatus(user: User, newStatus: boolean): void {
    if (user._id === this.currentAdminId && !newStatus) {
      alert('Action interdite : vous ne pouvez pas désactiver votre propre compte administrateur.');
      return;
    }
    this.selectedUser.set(user);
    this.targetNewStatus.set(newStatus);
  }

  cancelConfirmStatus(): void {
    this.selectedUser.set(null);
  }

  confirmStatusChange(): void {
    const target = this.selectedUser();
    if (!target) return;

    this.isUpdatingStatus.set(true);
    this.errorMessage.set('');

    this.userService
      .updateUserStatus(target._id, this.targetNewStatus())
      .subscribe({
        next: (res) => {
          this.isUpdatingStatus.set(false);
          this.successMessage.set(res.message);
          this.users.update((list) =>
            list.map((u) => (u._id === target._id ? { ...u, isActive: res.user.isActive } : u))
          );
          this.selectedUser.set(null);
          setTimeout(() => this.successMessage.set(''), 3500);
        },
        error: (err) => {
          this.isUpdatingStatus.set(false);
          this.errorMessage.set(
            err.error?.message || 'Erreur lors de la modification du statut.'
          );
          this.selectedUser.set(null);
        },
      });
  }
}
