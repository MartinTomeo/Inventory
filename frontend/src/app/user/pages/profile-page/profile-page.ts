import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Subscription, timer } from 'rxjs';
import { environment } from '@environments/environment.development';
import { AuthService } from '../../../auth/services/auth.service';
import { ProfileService } from '../../../auth/services/profile.service';
import { ProfileResponse, UpdateProfileRequest } from '../../../auth/interfaces/profile.interface';
import { FormUtils } from '../../../shared/utils/form-utils';
import { PhotoUtils } from '../../../shared/utils/photo-utils';

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
  photoError = signal<string | null>(null);
  readonly photoAccept = PhotoUtils.accept;


  isLoading = signal(false);
  isSaving = signal(false);
  isSubmitted = signal(false);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  private messageTimer: Subscription | null = null;

  fieldErrors = signal<Record<string, string | null>>({email: null, password: null});


  private readonly uploadsUrl = `${environment.apiUrl}/uploads`;

  profileForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email ,Validators.maxLength(254), Validators.pattern(/^[a-zA-Z0-9.@_%+-]+$/)]],
    password: ['', [Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9.@_%+-]+$/)]]});

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    if (this.isLoading() || this.isSaving()) return;

    this.isLoading.set(true);
    this.clearMessages();

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
            email: profile.user.email,
            password: '',
          });

          this.isSubmitted.set(false);
          this.fieldErrors.set({
            email: null,
            password: null,
          });
        },
        error: error => {
          this.showError(this.getErrorMessage(error, 'No se pudo cargar el perfil.'));
        },
      });
  }

  updateProfile(): void {
    const currentProfile = this.profile();

    if (!currentProfile || this.isSaving() || this.isLoading()) return;

    this.isSubmitted.set(true);
    this.clearMessages();

    // Normalizar los datos antes de validar.
    const values = this.profileForm.getRawValue();

    this.profileForm.patchValue({
      email: values.email.trim(),
    });

    // Estos mensajes quedan fijos hasta el próximo submit.
    this.fieldErrors.set({
      email: FormUtils.getFieldError(this.profileForm, 'email'),
      password: FormUtils.getFieldError(this.profileForm, 'password'),
    });

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const data = this.profileForm.getRawValue();
    const update: UpdateProfileRequest = {};

    if (data.email !== currentProfile.user.email) {
      update.email = data.email;
    }

    if (data.password !== '') {
      update.password = data.password;
    }

    if (Object.keys(update).length === 0) {
      this.showSuccess('No hay cambios para guardar.');
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
          this.profile.update(current => current ? { ...current, user: response.user } : current);
          this.authService.updateCurrentUser(response.user);
          this.profileForm.reset({
            email: response.user.email,
            password: '',
          });
          this.showSuccess('Perfil actualizado correctamente.');
        },
        error: error => {
          this.showError(this.getErrorMessage(error, 'No se pudo actualizar el perfil.'));
        },
      });
  }

  onPhotoSelected(event: Event): void {
    const selection = PhotoUtils.select(event);
    if (!selection) return;
    this.selectedPhoto.set(selection.photo);
    this.photoError.set(selection.error);
  }

  uploadPhoto(input: HTMLInputElement): void {
    const photo = this.selectedPhoto();

    if (!photo || this.photoError() || !this.profile() || this.isSaving() || this.isLoading()) return;

    this.isSaving.set(true);
    this.clearMessages();

    this.profileService.uploadProfilePhoto(photo)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: response => {
          this.profile.update(current =>
            current ? { ...current, user: { ...current.user, user_image: response.image }} : current);
          const user = this.profile()?.user;
          if (user) {
            this.authService.updateCurrentUser(user);
          }
          this.selectedPhoto.set(null);
          this.photoError.set(null);
          input.value = '';
          this.showSuccess('Imagen actualizada correctamente.');
        },
        error: error => {
          this.showError(this.getErrorMessage(error, 'No se pudo actualizar la imagen.'));
        },
      });
  }

  imageUrl(folder: 'users' | 'stock', filename: string): string {
    return `${this.uploadsUrl}/${folder}/${encodeURIComponent(filename)}`;
  }


  private clearMessages(): void {
    this.messageTimer?.unsubscribe();
    this.messageTimer = null;

    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  private showError(message: string): void {
    this.clearMessages();

    this.errorMessage.set(message);

    this.messageTimer = timer(2000)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.errorMessage.set(null);
        this.messageTimer = null;
      });

  }

  private showSuccess(message: string): void {
    this.clearMessages();

    this.successMessage.set(message);

    this.messageTimer = timer(2000)
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.successMessage.set(null);
        this.messageTimer = null;
      });

  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const photoMessage = PhotoUtils.uploadError(error.error?.error?.code);

      if (photoMessage) return photoMessage;

      const message = error.error?.error?.message;

      if (typeof message === 'string') {
        return message;
      }
    }
    return fallback;
  }
}
