import { Component, inject, signal } from '@angular/core';
import {ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormUtils } from '../../utils/form-utils';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';

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
  fieldErrors = signal<Record<string, string | null>>({});



  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9.@_%+-]+$/)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9.@_%+-]+$/)]]

  });

  onSubmit(): void {

  this.isSubmitted.set(true);
  this.hasError.set(false);
  this.fieldErrors.set({
    email: FormUtils.getFieldError(this.loginForm, 'email'),
    password: FormUtils.getFieldError(this.loginForm, 'password')
  });

  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }
  const {email = '', password = ''} = this.loginForm.getRawValue(); //getRawValue() devuelve valores de todos los campos. Para no generar errores con los parametros !
  this.authService.login(email!, password!).subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigateByUrl('/user');
        return;
      }
      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false);
      }, 2000);
    });

}
}
