import { Component, input, ResourceRef } from '@angular/core';
import { Subscriptions } from '../../../interfaces/subscriptions.interface';


@Component({
  selector: 'subscriptions-list',
  imports: [],
  templateUrl: './subscriptions-list.html',
})
export class SubscriptionsList {

  subscriptionsResource =input.required<ResourceRef<Subscriptions[]>>();


}
