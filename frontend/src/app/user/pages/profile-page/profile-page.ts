import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { environment } from '@environments/environment.development';
import { AuthService } from '../../../auth/services/auth.service';
import { ProfileService } from '../../../auth/services/profile.service';
import {ProfileResponse, UpdateProfileRequest} from '../../../auth/interfaces/profile.interface';
import { FormUtils } from '../../../shared/utils/form-utils';

@Component({
  selector: 'app-profile-page',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-page.html',
})
export class ProfilePage implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  profile = signal<ProfileResponse | null>(null);
  selectedPhoto = signal<File | null>(null);

  isLoading = signal(false);
  isSaving = signal(false);
  isSubmitted = signal(false);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  fieldErrors = signal<Record<string, string | null>>({username: null, email: null, password: null});


  private readonly uploadsUrl = `${environment.apiUrl}/uploads`;

  profileForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9.@_%+-]+$/)]],
    password: ['', [Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9.@_%+-]+$/)]]});

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    if (this.isLoading() || this.isSaving()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.profileService.getProfile()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: profile => {
          this.profile.set(profile);
          this.authService.updateCurrentUser(profile.user);

          this.profileForm.reset({
            username: profile.user.username,
            email: profile.user.email,
            password: '',
          });

          this.isSubmitted.set(false);
          this.fieldErrors.set({
            username: null,
            email: null,
            password: null,
          });
        },
        error: error => {
          this.errorMessage.set(
            this.getErrorMessage(error, 'No se pudo cargar el perfil.')
          );
        },
      });
  }

  updateProfile(): void {
    const currentProfile = this.profile();

    if (!currentProfile || this.isSaving() || this.isLoading()) return;

    this.isSubmitted.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // Normalizar los datos antes de validar.
    const values = this.profileForm.getRawValue();

    this.profileForm.patchValue({
      username: values.username.trim(),
      email: values.email.trim(),
    });

    // Estos mensajes quedan fijos hasta el próximo submit.
    this.fieldErrors.set({
      username: FormUtils.getFieldError(this.profileForm, 'username'),
      email: FormUtils.getFieldError(this.profileForm, 'email'),
      password: FormUtils.getFieldError(this.profileForm, 'password'),
    });

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const data = this.profileForm.getRawValue();
    const update: UpdateProfileRequest = {};

    if (data.username !== currentProfile.user.username) {
      update.username = data.username;
    }

    if (data.email !== currentProfile.user.email) {
      update.email = data.email;
    }

    // Vacío significa conservar la contraseña actual.
    if (data.password !== '') {
      update.password = data.password;
    }

    if (Object.keys(update).length === 0) {
      this.successMessage.set('No hay cambios para guardar.');
      return;
    }

    this.isSaving.set(true);

    this.profileService.updateProfile(update)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: response => {
          this.profile.update(current =>
            current ? { ...current, user: response.user } : current
          );

          this.authService.updateCurrentUser(response.user);

          this.profileForm.reset({
            username: response.user.username,
            email: response.user.email,
            password: '',
          });

          this.successMessage.set('Perfil actualizado correctamente.');
        },
        error: error => {
          this.errorMessage.set(
            this.getErrorMessage(error, 'No se pudo actualizar el perfil.')
          );
        },
      });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const photo = input.files?.[0] ?? null;

    this.selectedPhoto.set(null);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!photo) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(photo.type)) {
      input.value = '';
      this.errorMessage.set('Seleccioná una imagen JPG, PNG o WebP.');
      return;
    }

    if (photo.size > 5 * 1024 * 1024) {
      input.value = '';
      this.errorMessage.set('La imagen no puede superar los 5 MB.');
      return;
    }

    this.selectedPhoto.set(photo);
  }

  uploadPhoto(input: HTMLInputElement): void {
    const photo = this.selectedPhoto();

    if (!photo || !this.profile() || this.isSaving()) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.profileService.uploadProfilePhoto(photo)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: response => {
          this.profile.update(current =>
            current
              ? {
                  ...current,
                  user: {
                    ...current.user,
                    user_image: response.image,
                  },
                }
              : current
          );

          const user = this.profile()?.user;

          if (user) {
            this.authService.updateCurrentUser(user);
          }

          this.selectedPhoto.set(null);
          input.value = '';

          this.successMessage.set('Imagen actualizada correctamente.');
        },
        error: error => {
          this.errorMessage.set(
            this.getErrorMessage(error, 'No se pudo actualizar la imagen.')
          );
        },
      });
  }

  imageUrl(folder: 'users' | 'stock', filename: string): string {
    return `${this.uploadsUrl}/${folder}/${encodeURIComponent(filename)}`;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.error?.message;

      if (typeof message === 'string') {
        return message;
      }
    }

    return fallback;
  }
}
