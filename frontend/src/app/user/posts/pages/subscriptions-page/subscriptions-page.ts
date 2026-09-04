
import { Component, inject } from '@angular/core';
import { SubsService } from "../../../services/subs.service";
import { SubscriptionsList } from "../../components/subscriptions-list/subscriptions-list";
import { SearchInput } from "../../../../shared/components/search-input/search-input";
import { NewDeleteButtons } from '../../components/new-delete-buttons/new-delete-buttons';



@Component({
  selector: 'subscriptions-page',
  imports: [SubscriptionsList, SearchInput, NewDeleteButtons],
  templateUrl: './subscriptions-page.html',
})
export class SubscriptionsPage {
    subsService = inject(SubsService);
}
