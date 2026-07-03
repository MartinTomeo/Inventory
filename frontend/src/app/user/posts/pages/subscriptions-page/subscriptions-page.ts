
import { Component, signal, inject } from '@angular/core';
import { PostService } from "../../services/post.service";
import { SubscriptionsList } from "../../components/subscriptions-list/subscriptions-list";
import { SearchInput } from "../../../../shared/components/search-input/search-input";
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NewDeleteButtons } from '../../components/new-delete-buttons/new-delete-buttons';
import { Subscriptions } from '../../../interfaces/subscriptions.interface';


@Component({
  selector: 'subscriptions-page',
  imports: [SubscriptionsList, SearchInput, NewDeleteButtons],
  templateUrl: './subscriptions-page.html',
})
export class SubscriptionsPage {
    postsService = inject(PostService);
}
