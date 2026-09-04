import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { UsersService } from '../../../services/users.service';
import { environment } from '@environments/environment.development';
import { FormUtils } from '../../../../shared/utils/form-utils';
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
  isSubmited = signal(false);
  selectedPhoto = signal<File | null>(null);
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
    email: ['', [Validators.required, Validators.email, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9.@_%+-]+$/),]],
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
    });
  }

  onPhotoSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.selectedPhoto.set(input.files[0]);
  }

  onSubmit() {
    this.hasFormError.set(false);
    this.isSubmited.set(true);

    const errors = this.evaluateFormErrors();
    this.submittedControlErrors.set(errors);

    if (this.userForm.invalid) {
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
    this.isSubmited.set(false);
    this.submittedControlErrors.set({});
    this.selectedPhoto.set(null);
    this.usersService.newUser();
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
    .subscribe({
      next: () => {
        this.usersService.usersResource.reload();
        this.submittedControlErrors.set({});
        this.isSubmited.set(false);
        this.hasFormError.set(false);
        this.usersService.newUser();
      },
      error: (error: HttpErrorResponse) => {
        this.showRequestError(error);
      }
    });
  }

  private updateUser() {
    const id = this.usersService.selectedUserId();
    if (id === null) {
      return;
    }
    const value = this.userForm.getRawValue();

    const payload: {
      username: string;
      email: string;
      password?: string;
      role: 1 | 2 | 3;
    } = {
      username: value.username,
      email: value.email,
      role: value.role,
    };

    if (value.password.trim()) {
      payload.password = value.password;
    }

    this.usersService.updateUser(id, payload)
      .subscribe({
        next: () => {
          const photo = this.selectedPhoto();
          if (photo){
            this.usersService.uploadUserPhoto(id, photo)
              .subscribe({
                next: () => {
                  this.reloadResources();
                }
              });

            return;
          }
          this.reloadResources();
        },
        error: (error: HttpErrorResponse) => {
          this.showRequestError(error);
        }
      });
  }

  private reloadResources() {

    this.usersService.usersResource.reload();
    this.usersService.selectedUserResource.reload();
    this.selectedPhoto.set(null);
    this.submittedControlErrors.set({});
    this.isSubmited.set(false);
    this.hasFormError.set(false);
  }

  private showFormError(message: string) {
    this.formError.set(message);
    this.hasFormError.set(true);

    setTimeout(() => {
      this.hasFormError.set(false);
    }, 2000);
  }

  private showRequestError(error: HttpErrorResponse) {
    const code = error.error?.error?.code;

    if (code === 'USERNAME_ALREADY_EXISTS') {
      this.showFormError('A user with that username already exists.');
      return;
    }

    if (code === 'EMAIL_ALREADY_EXISTS') {
      this.showFormError('A user with that email already exists.');
      return;
    }

    this.showFormError('The user could not be saved. Please try again.');
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
