
import { Component, inject } from '@angular/core';
import { PostService } from "../../services/post.service";
import { SubscriptionsListForms } from "../../components/subscriptions-list-forms/subscriptions-list-forms";
import { SearchInput } from "../../../../shared/components/search-input/search-input";

import { NewDeleteButtons } from '../../components/new-delete-buttons/new-delete-buttons';



@Component({
  selector: 'subscriptions-page',
  imports: [SubscriptionsListForms, SearchInput, NewDeleteButtons],
  templateUrl: './subscriptions-page.html',
})
export class SubscriptionsPage {
    postsService = inject(PostService);
}
