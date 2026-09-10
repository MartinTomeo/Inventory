import { Component, computed, inject, signal } from '@angular/core';
import { environment } from '@environments/environment.development';
import { Subscription } from '../../interfaces/subscriptions.interface';
import { SubsService } from '../../services/subs.service';

@Component({
  selector: 'subscriptions-list',
  imports: [],
  templateUrl: './subscriptions-list.html',
})
export class SubscriptionsList {
  subsService = inject(SubsService);
  expandedSubscriptionId = signal<number | null>(null);

  visibleIds = computed(() =>
    this.subsService.subsResource.value().map((subscription) => subscription.id)
  );

  allVisibleSelected = computed(() => {
    const ids = this.visibleIds();
    return ids.length > 0 && ids.every((id) => this.subsService.isSelected(id));
  });

  someVisibleSelected = computed(() => {
    const ids = this.visibleIds();
    const selectedCount = ids.filter((id) =>
      this.subsService.isSelected(id)
    ).length;

    return selectedCount > 0 && selectedCount < ids.length;
  });

  toggleSubscription(id: number, checked: boolean) {
    this.subsService.toggleSelection(id, checked);
  }

  toggleAllVisible(checked: boolean) {
    this.subsService.selectAll(this.visibleIds(), checked);
  }

  toggleImages(subscriptionId: number) {
    this.expandedSubscriptionId.update((currentId) =>
      currentId === subscriptionId ? null : subscriptionId
    );
  }

  userImageUrl(subscription: Subscription): string {
    if (!subscription.user_image) {
      return `${environment.apiUrl}/uploads/users/profile.png`;
    }

    return `${environment.apiUrl}/uploads/users/${encodeURIComponent(
      subscription.user_image
    )}`;
  }

  stockImageUrl(subscription: Subscription): string | null {
    if (!subscription.phone_image) return null;

    return `${environment.apiUrl}/uploads/stock/${encodeURIComponent(
      subscription.phone_image
    )}`;
  }

  resourceError(): string {
    const error = this.subsService.subsResource.error();

    return error instanceof Error
      ? error.message
      : 'No se pudieron cargar las suscripciones.';
  }
}
