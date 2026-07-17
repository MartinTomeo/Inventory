import { Component, inject, input, ResourceRef, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormUtils } from '../../../../shared/utils/form-utils';
import { User } from '../../../interfaces/users.interface';
import { environment } from '../../../../../environments/environment';
@Component({
  selector: 'admin-users-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-users-form.html',
})
export class AdminUsersForm {

  private fb = inject(FormBuilder);
  formUtils = FormUtils;
  userResource = input.required<ResourceRef<User>>();

  imageUrl = computed(() => {
    const user = this.userResource().value();

    if (!user?.user_image) {
      return `${environment.apiUrl}/uploads/users/profile.png`;
    }

    return `${environment.apiUrl}/uploads/users/${user.user_image}`;
  });

  userForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9.@_%+-]+$/)]],
    password: ['', [Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9.@_%+-]+$/)]],
    role: ['', [Validators.required, Validators.max(3), Validators.min(1)]],

  });


  constructor() {
    this.userForm.disable();

    effect(() => {
      const resource = this.userResource();

      if (!resource || !resource.hasValue()) {
        this.userForm.reset();
        this.userForm.disable();
        return;
      }

      const user = resource.value();

      if (!user) {
        this.userForm.reset();
        this.userForm.disable();
        return;
      }

      this.userForm.enable();

      this.userForm.reset({
        username: user.username,
        email: user.email,
        role: user.role,
        user_image: user.user_image,
      });
    });
  }



  onSubmit() {
    if (this.userForm.valid) {
      console.log('Form Submitted!', this.userForm.value);
      // Add your save logic here
    }
  }

}
