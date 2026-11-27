/**
 * login.component.ts — User Login Page Component (`/login`)
 *
 * Uses a Reactive Form (`loginForm`) to validate email/password, calls `AuthService.login()`,
 * and redirects the user either to `returnUrl` (if redirected by a guard) or to their
 * role-specific home page (`admin` -> `/admin-dashboard/users`, `restaurateur` -> `/restaurateur/dashboard`, `client` -> `/`).
 */
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  isLoading = signal(false);
  errorMessage = signal('');

  // Validates login form, calls AuthService.login(), and redirects based on returnUrl or user role
  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
          return;
        }

        const role = res.user.role;
        if (role === 'admin') {
          this.router.navigate(['/admin-dashboard/users']);
        } else if (role === 'restaurateur') {
          this.router.navigate(['/restaurateur/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || 'Identifiants invalides ou service temporairement indisponible'
        );
      },
    });
  }
}
