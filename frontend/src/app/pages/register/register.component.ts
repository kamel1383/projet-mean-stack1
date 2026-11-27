/**
 * register.component.ts — Client Registration Page Component (`/register`)
 *
 * Validates user details, phone format, password strength, and password confirmation
 * using a custom `passwordMatchValidator`, then calls `AuthService.register()`.
 * Note: New public sign-ups are always created with the `'client'` role on the backend.
 */
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

// Custom cross-field validator ensuring `password` and `confirmation` match
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('confirmation')?.value;
  if (password && confirmation && password !== confirmation) {
    return { passwordsMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group(
    {
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{8,15}$/)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
        ],
      ],
      confirmation: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  isLoading = signal(false);
  errorMessage = signal('');

  // Validates registration form, creates the client account, and redirects to home
  onSubmit(): void {
    if (this.registerForm.invalid || this.isLoading()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const val = this.registerForm.value;

    this.authService
      .register({
        nom: val.nom,
        prenom: val.prenom,
        email: val.email,
        telephone: val.telephone,
        password: val.password,
        confirmation: val.confirmation,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            err.error?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.'
          );
        },
      });
  }
}
