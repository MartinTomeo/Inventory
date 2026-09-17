import { Component, inject, signal } from '@angular/core';
import {ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormUtils } from '../../../shared/utils/form-utils';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs'

@Component({
  selector: 'login-form',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
})
export class LoginPage {

  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  formUtils = FormUtils;
  hasError = signal(false);
  isSubmitted = signal(false);
  isLoading = signal(false);
  fieldErrors = signal<Record<string, string | null>>({});

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254), Validators.pattern(/^[a-zA-Z0-9.@_%+-]+$/)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9.@_%+-]+$/)]]
  });

  onSubmit(): void {
    if (this.isLoading()) return;
    this.isSubmitted.set(true);
    this.hasError.set(false);
    this.authService.logoutError.set(null);
    this.fieldErrors.set({
      email: FormUtils.getFieldError(this.loginForm, 'email'),
      password: FormUtils.getFieldError(this.loginForm, 'password'),
    });

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email = '', password = '' } = this.loginForm.getRawValue();

    this.authService.login( email!, password! )
    .pipe(
      finalize(() => this.isLoading.set(false))
    )
      .subscribe(
        isAuthenticated => {

        if (isAuthenticated) {
          this.router.navigateByUrl('/user/subs');
          return;
        }
        this.hasError.set(true);
        setTimeout(() => {
          this.hasError.set(false);
        }, 2000);
      }
    );
  }

}
