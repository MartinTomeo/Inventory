import { SubsService } from '../../../services/subs.service';
import { Component, inject, computed, output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'subscriptions-list',
  imports: [],
  templateUrl: './subscriptions-list.html',
})
export class SubscriptionsList {

  subsService = inject(SubsService);

  /*
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


*/
}
