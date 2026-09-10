import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { environment } from '@environments/environment.development';
import { catchError, map, Observable, throwError } from 'rxjs';
import {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  DeleteSubscriptionsResponse,
  Subscription,
  SubscriptionOptionsResponse,
} from '../interfaces/subscriptions.interface';
import { ApiResponse } from '../interfaces/api-response.interface';
@Injectable({
  providedIn: 'root',
})
export class SubsService {
  private http = inject(HttpClient);

  query = signal('');
  selectedIds = signal<number[]>([]);
  hasSelection = computed(() => this.selectedIds().length > 0);

  getSubscriptions(): Observable<Subscription[]> {
    return this.http
      .get<ApiResponse<Subscription[]>>(`${environment.apiUrl}/subscriptions`)
      .pipe(
        map((response) =>
          response.data.map((subscription) =>
            this.normalizeSubscription(subscription)
          )
        )
      );
  }

  getSubscriptionsByUsername(username: string): Observable<Subscription[]> {
    return this.http
      .get<ApiResponse<Subscription[]>>(
        `${environment.apiUrl}/subscriptions/${encodeURIComponent(username)}`
      )
      .pipe(
        map((response) =>
          response.data.map((subscription) =>
            this.normalizeSubscription(subscription)
          )
        )
      );
  }

  getSubscriptionOptions(): Observable<SubscriptionOptionsResponse> {
    return this.http
      .get<ApiResponse<SubscriptionOptionsResponse>>(
        `${environment.apiUrl}/subscriptions/options`
      )
      .pipe(
        map((response) => ({
          users: response.data.users.map((user) => ({
            ...user,
            id: Number(user.id),
          })),
          stock: response.data.stock.map((stock) => ({
            ...stock,
            id: Number(stock.id),
            line: Number(stock.line),
          })),
        }))
      );
  }

  postSubscription(subscription: CreateSubscriptionRequest) {
    return this.http.post<ApiResponse<CreateSubscriptionResponse>>(
      `${environment.apiUrl}/subscriptions`,
      subscription
    );
  }

  deleteSubscriptions(idArray: number[]) {
    return this.http.delete<ApiResponse<DeleteSubscriptionsResponse>>(
      `${environment.apiUrl}/subscriptions`,
      { body: { idArray } }
    );
  }

  isSelected(id: number): boolean {
    return this.selectedIds().includes(id);
  }

  toggleSelection(id: number, checked: boolean) {
    this.selectedIds.update((currentIds) => {
      if (checked) {
        return currentIds.includes(id) ? currentIds : [...currentIds, id];
      }

      return currentIds.filter((currentId) => currentId !== id);
    });
  }

  selectAll(ids: number[], checked: boolean) {
    this.selectedIds.update((currentIds) => {
      if (!checked) {
        return currentIds.filter((id) => !ids.includes(id));
      }

      return [...new Set([...currentIds, ...ids])];
    });
  }

  clearSelection() {
    this.selectedIds.set([]);
  }

  private normalizeSubscription(
    subscription: Subscription
  ): Subscription {
    return {
      ...subscription,
      id: Number(subscription.id),
      user_id: Number(subscription.user_id),
      stock_id: Number(subscription.stock_id),
      line: Number(subscription.line),
    };
  }

  subsResource = rxResource<Subscription[], { query: string }>({
    params: () => ({ query: this.query().trim() }),
    defaultValue: [],
    stream: ({ params }) => {
      const request$ = params.query
        ? this.getSubscriptionsByUsername(params.query)
        : this.getSubscriptions();

      return request$.pipe(
        catchError(() =>
          throwError(
            () =>
              new Error(
                params.query
                  ? 'No se pudieron buscar las suscripciones.'
                  : 'No se pudieron cargar las suscripciones.'
              )
          )
        )
      );
    },
  });
}
