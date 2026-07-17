import { Component, inject, input, ResourceRef } from '@angular/core';
import { Subscriptions } from '../../../interfaces/subscriptions.interface';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'subscriptions-list-forms',
  imports: [],
  templateUrl: './subscriptions-list-forms.html',
})
export class SubscriptionsListForms {

  subscriptionsResource =input.required<ResourceRef<Subscriptions[]>>();
  private formBuilder = inject(FormBuilder);

  myForm: FormGroup = this.formBuilder.group({
    username: [''],
    email: [''],
    user_image: [''],
    model: [''],
    brand: [''],
    imei: [''],
    stock_provider: [''],
    phone_image: [''],
    line: [0],
    line_provider: ['']
  });




}
