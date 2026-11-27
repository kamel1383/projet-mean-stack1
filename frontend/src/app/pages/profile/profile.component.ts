/**
 * profile.component.ts — User Profile & Security Page (`/profile`)
 *
 * Lets any logged-in user view their account info, upload/resize a profile picture
 * (converted to base64 via HTML5 Canvas so it stays under 1 MB), update their name/phone,
 * or change their password via `UserService`.
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmation = control.get('confirmation')?.value;
  if (newPassword && confirmation && newPassword !== confirmation) {
    return { passwordsMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  user = signal<User | null>(this.authService.currentUser());

  profileForm: FormGroup = this.fb.group({
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    nom: ['', [Validators.required, Validators.minLength(2)]],
    telephone: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{8,15}$/)]],
  });

  passwordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: [
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

  isSavingProfile = signal(false);
  isUploadingPhoto = signal(false);
  profileSuccessMessage = signal('');
  profileErrorMessage = signal('');

  isChangingPassword = signal(false);
  passwordSuccessMessage = signal('');
  passwordErrorMessage = signal('');

  ngOnInit(): void {
    const cached = this.authService.currentUser();
    if (cached) {
      this.profileForm.patchValue({
        prenom: cached.prenom,
        nom: cached.nom,
        telephone: cached.telephone,
      });
    }
    this.loadProfile();
  }

  // Fetches the latest profile from GET /api/users/me and syncs it into AuthService & the form
  loadProfile(): void {
    this.userService.getProfile().subscribe({
      next: (res) => {
        this.user.set(res.user);
        this.authService.updateCurrentUser(res.user);
        this.profileForm.patchValue({
          prenom: res.user.prenom,
          nom: res.user.nom,
          telephone: res.user.telephone,
        });
      },
      error: () => {
        const fallback = this.authService.currentUser();
        if (fallback) {
          this.user.set(fallback);
          this.profileForm.patchValue({
            prenom: fallback.prenom,
            nom: fallback.nom,
            telephone: fallback.telephone,
          });
        }
      },
    });
  }

  // Submits updated name and phone number to PUT /api/users/me
  onSaveProfile(): void {
    if (this.profileForm.invalid || this.isSavingProfile()) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSavingProfile.set(true);
    this.profileSuccessMessage.set('');
    this.profileErrorMessage.set('');

    const { nom, prenom, telephone } = this.profileForm.value;

    this.userService.updateProfile({ nom, prenom, telephone }).subscribe({
      next: (res) => {
        this.isSavingProfile.set(false);
        this.user.set(res.user);
        this.authService.updateCurrentUser(res.user);
        this.profileSuccessMessage.set('Informations de profil mises à jour avec succès !');
        setTimeout(() => this.profileSuccessMessage.set(''), 4000);
      },
      error: (err) => {
        this.isSavingProfile.set(false);
        this.profileErrorMessage.set(
          err.error?.message || 'Erreur lors de la mise à jour du profil.'
        );
      },
    });
  }

  // Submits current & new password to PUT /api/users/me/password
  onChangePassword(): void {
    if (this.passwordForm.invalid || this.isChangingPassword()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword.set(true);
    this.passwordSuccessMessage.set('');
    this.passwordErrorMessage.set('');

    const { currentPassword, newPassword, confirmation } = this.passwordForm.value;

    this.userService
      .changePassword({ currentPassword, newPassword, confirmation })
      .subscribe({
        next: () => {
          this.isChangingPassword.set(false);
          this.passwordSuccessMessage.set('Mot de passe modifié avec succès !');
          this.passwordForm.reset();
          setTimeout(() => this.passwordSuccessMessage.set(''), 4000);
        },
        error: (err) => {
          this.isChangingPassword.set(false);
          this.passwordErrorMessage.set(
            err.error?.message || 'Erreur lors du changement de mot de passe.'
          );
        },
      });
  }

  // Reads the chosen image file, resizes it to max 256x256 JPEG base64, and uploads it
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.profileErrorMessage.set('Veuillez sélectionner un fichier image (PNG, JPG ou WebP).');
      return;
    }

    this.isUploadingPhoto.set(true);
    this.profileErrorMessage.set('');
    this.profileSuccessMessage.set('');

    this.resizeImageToBase64(file, 256, 256)
      .then((base64Image) => {
        this.userService.updateProfile({ photoProfil: base64Image }).subscribe({
          next: (res) => {
            this.isUploadingPhoto.set(false);
            this.user.set(res.user);
            this.authService.updateCurrentUser(res.user);
            this.profileSuccessMessage.set('Photo de profil mise à jour !');
            setTimeout(() => this.profileSuccessMessage.set(''), 4000);
          },
          error: (err) => {
            this.isUploadingPhoto.set(false);
            this.profileErrorMessage.set(
              err.error?.message || 'Erreur lors de l\'envoi de la photo.'
            );
          },
        });
      })
      .catch(() => {
        this.isUploadingPhoto.set(false);
        this.profileErrorMessage.set('Impossible de lire ou traiter cette image.');
      });

    input.value = '';
  }

  // Clears the user's profile picture by sending an empty string to PUT /api/users/me
  onRemovePhoto(): void {
    if (this.isUploadingPhoto()) return;
    this.isUploadingPhoto.set(true);
    this.userService.updateProfile({ photoProfil: '' }).subscribe({
      next: (res) => {
        this.isUploadingPhoto.set(false);
        this.user.set(res.user);
        this.authService.updateCurrentUser(res.user);
        this.profileSuccessMessage.set('Photo de profil supprimée.');
        setTimeout(() => this.profileSuccessMessage.set(''), 4000);
      },
      error: (err) => {
        this.isUploadingPhoto.set(false);
        this.profileErrorMessage.set(
          err.error?.message || 'Erreur lors de la suppression de la photo.'
        );
      },
    });
  }

  // Uses an off-screen HTML5 Canvas to downscale an image file and encode it as JPEG base64
  private resizeImageToBase64(file: File, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Erreur de lecture'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Image invalide'));
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Contexte Canvas indisponible'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  onLogout(): void {
    this.authService.logout();
  }
}
