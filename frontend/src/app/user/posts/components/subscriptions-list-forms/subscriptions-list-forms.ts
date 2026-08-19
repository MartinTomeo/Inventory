import { Component, inject, computed, output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'subscriptions-list-forms',
  imports: [],
  templateUrl: './subscriptions-list-forms.html',
})
export class SubscriptionsListForms {

  subscriptions =inject(PostService);
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


  openSubscriptionDetails(subscriptionId: string) {
    this.subscriptions.getSubscriptionsById(parseInt(subscriptionId)).subscribe((subscriptionDetails) => {
      if (subscriptionDetails.length > 0) {
        const subscription = subscriptionDetails[0];
      }
    });
  }



}
