import { finalize, of, switchMap } from 'rxjs';
import { PhotoUtils } from '../../../shared/utils/photo-utils';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { environment } from '@environments/environment.development';
import { FormUtils } from '../../../shared/utils/form-utils';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'users-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users-form.html',
})
export class UsersForm {

  private fb = inject(FormBuilder);
  usersService = inject(UsersService);
  formUtils = FormUtils;
  isSaving = signal(false);
  isSubmited = signal(false);
  selectedPhoto = signal<File | null>(null);
  photoError = signal<string | null>(null);
  readonly photoAccept = PhotoUtils.accept;
  selectedUser = computed(() =>
    this.usersService.selectedUserResource.value()
  );

  imageUrl = computed(() => {
    const user = this.selectedUser();
    if (!user?.user_image) {
      return `${environment.apiUrl}/uploads/users/profile.png`;
    }
    return `${environment.apiUrl}/uploads/users/${user.user_image}`;
  });

  //Para toast con error 409
  formError = signal<string>('');
  hasFormError = signal(false);

  //Para guardar los errores de formControls y que se renderizen denuevo en onSubmit()
  submittedControlErrors = signal<Record<string, string>>({}); //para guardar los errores de formControls y que se renderizen denuevo en onSubmit()

  userForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9.@_%+-]+$/)]],
    password: ['', [Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9.@_%+-]+$/),]],
    role: [1 as 1 | 2 | 3, [Validators.required, Validators.min(1), Validators.max(3),]],
  });

  constructor() {

    effect(() => {

      const mode = this.usersService.formMode();
      this.configurePasswordValidators(mode);
      if (mode === 'new') {
        this.isSubmited.set(false);
        this.userForm.reset({
          username: '',
          email: '',
          password: '',
          role: 1,
        });
        this.selectedPhoto.set(null);
        this.photoError.set(null);
        return;
      }

      const user = this.selectedUser();

      if (!user) {
        return;
      }

      this.isSubmited.set(false);

      this.userForm.reset({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role as 1 | 2 | 3,
      });

      this.selectedPhoto.set(null);
      this.photoError.set(null);
    });
  }

  onPhotoSelected(event: Event): void {
    if (this.isSaving()) return;

    const selection = PhotoUtils.select(event);
    if (!selection) return;
    this.selectedPhoto.set(selection.photo);
    this.photoError.set(selection.error);
  }

  onSubmit() {
    if (this.isSaving()) return;

    this.hasFormError.set(false);
    this.isSubmited.set(true);

    const errors = this.evaluateFormErrors();
    this.submittedControlErrors.set(errors);

    if (this.userForm.invalid || this.photoError()) {
      this.userForm.markAllAsTouched();
      return;
    }
    if (this.usersService.formMode() === 'new') {
      this.createUser();
      return;
    }
    this.updateUser();

  }

  clearForm() {
    if (this.isSaving()) return;

    this.isSubmited.set(false);
    this.submittedControlErrors.set({});
    this.selectedPhoto.set(null);
    this.photoError.set(null);
    this.usersService.newUser();
    this.userForm.reset({ username: '', email: '', password: '', role: 1 });
  }

  private configurePasswordValidators(mode: 'new' | 'edit') {

    const passwordControl = this.userForm.controls.password;

    if (mode === 'new') {

      passwordControl.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9.@_%+-]+$/),
      ]);

    } else {

      passwordControl.setValidators([
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9.@_%+-]+$/),
      ]);
    }

    passwordControl.updateValueAndValidity({
      emitEvent: false
    });
  }

  private createUser() {
    this.isSaving.set(true);
    const value = this.userForm.getRawValue();

    this.usersService.postUser(
      {
        username: value.username,
        email: value.email,
        password: value.password,
        role: value.role,
      },
      this.selectedPhoto()
    )
    .pipe(finalize(() => this.isSaving.set(false)))
    .subscribe({
      next: () => {
        this.usersService.usersResource.reload();
        this.selectedPhoto.set(null);
        this.photoError.set(null);
        this.submittedControlErrors.set({});
        this.isSubmited.set(false);
        this.hasFormError.set(false);
        this.usersService.newUser();
        this.userForm.reset({ username: '', email: '', password: '', role: 1 });
      },
      error: (error: HttpErrorResponse) => {
        this.showRequestError(error);
      }
    });
  }

  private updateUser() {
    const id = this.usersService.selectedUserId();

    if (id === null || this.isSaving()) return;

    const value = this.userForm.getRawValue();
    const photo = this.selectedPhoto();
    const payload = {
      username: value.username,
      email: value.email,
      role: value.role,
      ...(value.password.trim() ? { password: value.password } : {}),
    };

    let dataSaved = false;
    this.isSaving.set(true);

    this.usersService.updateUser(id, payload).pipe(
      switchMap(() => {
        dataSaved = true;
        return photo
          ? this.usersService.uploadUserPhoto(id, photo)
          : of(null);
      }),
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: () => {
        // La lista puede cambiar de selección mientras se guarda.
        if (this.usersService.selectedUserId() !== id) {
          this.usersService.usersResource.reload();
          return;
        }
        this.reloadResources();
      },
      error: (error: HttpErrorResponse) => {
        if (dataSaved) {
          this.usersService.usersResource.reload();
        }
        if (this.usersService.selectedUserId() !== id) return;

        if (dataSaved && photo) {
          const message = PhotoUtils.uploadError(error.error?.error?.code);
          if (message) this.photoError.set(message);
          this.showFormError(
            'Los datos se guardaron, pero no se pudo subir la imagen.' +
            (message ? ` ${message}` : '')
          );
          return;
        }
        this.showRequestError(error);
      },
    });
  }

  private reloadResources() {

    this.usersService.usersResource.reload();
    this.usersService.selectedUserResource.reload();
    this.selectedPhoto.set(null);
    this.photoError.set(null);
    this.submittedControlErrors.set({});
    this.isSubmited.set(false);
    this.hasFormError.set(false);
  }

  private formErrorTimeout?: ReturnType<typeof setTimeout>;

  private showFormError(message: string) {
    if (this.formErrorTimeout !== undefined) {
      clearTimeout(this.formErrorTimeout);
    }
    this.formError.set(message);
    this.hasFormError.set(true);

    this.formErrorTimeout = setTimeout(() => {
      this.hasFormError.set(false);
    }, 2000);
  }

  private showRequestError(error: HttpErrorResponse) {
    const code = error.error?.error?.code;

    if (code === 'USERNAME_ALREADY_EXISTS') {
      this.showFormError('Ya existe un usuario con ese nombre.');
      return;
    }

    if (code === 'EMAIL_ALREADY_EXISTS') {
      this.showFormError('Ya existe un usuario con ese email.');
      return;
    }

    // Un conflicto siempre se muestra como aviso general.
    if (error.status === 409) {
      this.showFormError('No se pudo guardar: hay datos repetidos o en conflicto.');
      return;
    }

    const photoMessage = PhotoUtils.uploadError(code);
    if (photoMessage) {
      this.photoError.set(photoMessage);
      return;
    }

    this.showFormError('No se pudo guardar. Intentá nuevamente.');
  }


private evaluateFormErrors(): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const fieldName of Object.keys(this.userForm.controls)) {
    const error = FormUtils.getFieldError(this.userForm, fieldName);

    if (error) {
      errors[fieldName] = error;
    }
  }

  return errors;
}

}
