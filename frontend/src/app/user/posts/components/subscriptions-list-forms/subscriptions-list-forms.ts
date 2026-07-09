import { Component, input, ResourceRef } from '@angular/core';
import { Subscriptions } from '../../../interfaces/subscriptions.interface';


@Component({
  selector: 'subscriptions-list-forms',
  imports: [],
  templateUrl: './subscriptions-list-forms.html',
})
export class SubscriptionsListForms {

  subscriptionsResource =input.required<ResourceRef<Subscriptions[]>>();


}
