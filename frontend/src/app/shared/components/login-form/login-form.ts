
import { Component, inject } from '@angular/core';
import {ReactiveFormsModule, FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'login-form',
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.html',
})
export class LoginForm {

  private formBuilder = inject(FormBuilder);

  myForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9.@_%+-]+$/)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
  });

  onConsoleLog() {
    console.log('Email:', this.myForm.value.email);
    console.log('Password:', this.myForm.value.password);
  }

}
