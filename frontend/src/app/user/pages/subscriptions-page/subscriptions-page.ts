import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { SubscriptionStockOption, SubscriptionUserOption } from '../../interfaces/subscriptions.interface';
import { SubsService } from '../../services/subs.service';
import { NewDeleteButtons } from '../../components/new-delete-buttons/new-delete-buttons';
import { SubscriptionsList } from '../../components/subscriptions-list/subscriptions-list';
import { SearchInput } from '../../../shared/components/search-input/search-input';

@Component({
  selector: 'subscriptions-page',
  imports: [ReactiveFormsModule, SubscriptionsList, SearchInput, NewDeleteButtons],
  templateUrl: './subscriptions-page.html',
})
export class SubscriptionsPage {
  private formBuilder = inject(FormBuilder);
  subsService = inject(SubsService);

  isCreateModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  isLoadingOptions = signal(false);
  isCreating = signal(false);
  isDeleting = signal(false);
  formError = signal<string | null>(null);
  deleteError = signal<string | null>(null);

  users = signal<SubscriptionUserOption[]>([]);
  availableStock = signal<SubscriptionStockOption[]>([]);

  subscriptionForm = this.formBuilder.nonNullable.group({
    user_id: [0, [Validators.required, Validators.min(1)]],
    stock_id: [0, [Validators.required, Validators.min(1)]],
  });

  search(value: string | number) {
    this.subsService.clearSelection();
    this.subsService.query.set(value.toString());
  }

  openCreateModal() {
    this.formError.set(null);
    this.users.set([]);
    this.availableStock.set([]);
    this.subscriptionForm.reset({ user_id: 0, stock_id: 0 });
    this.isCreateModalOpen.set(true);
    this.isLoadingOptions.set(true);

    this.subsService.getSubscriptionOptions()
      .pipe(finalize(() => this.isLoadingOptions.set(false)))
      .subscribe({
        next: ({ users, stock }) => {
          this.users.set(users);
          this.availableStock.set(stock);
        },
        error: () => {
          this.formError.set(
            'No se pudieron cargar los usuarios y equipos disponibles.'
          );
        },
      });
  }

  closeCreateModal() {
    if (this.isCreating()) return;
    this.isCreateModalOpen.set(false);
    this.formError.set(null);
  }

  createSubscription() {
    this.formError.set(null);
    this.subscriptionForm.markAllAsTouched();
    if (this.subscriptionForm.invalid || this.isCreating()) return;
    this.isCreating.set(true);

    this.subsService.postSubscription(this.subscriptionForm.getRawValue())
      .pipe(finalize(() => this.isCreating.set(false)))
      .subscribe({
        next: () => {
          this.isCreateModalOpen.set(false);
          this.subscriptionForm.reset({ user_id: 0, stock_id: 0 });
          this.subsService.subsResource.reload();
        },
        error: (error: HttpErrorResponse) => {
          this.formError.set(
            error.status === 409
              ? error.error?.error?.message ??
                  'El equipo seleccionado ya tiene un usuario asignado.'
              : 'No se pudo crear la suscripción.'
          );
        },
      });
  }

  openDeleteModal() {
    if (!this.subsService.hasSelection()) return;
    this.deleteError.set(null);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    if (this.isDeleting()) return;
    this.isDeleteModalOpen.set(false);
    this.deleteError.set(null);
  }

  confirmDelete() {
    const ids = this.subsService.selectedIds();

    if (ids.length === 0 || this.isDeleting()) return;

    this.isDeleting.set(true);
    this.deleteError.set(null);

    this.subsService
      .deleteSubscriptions(ids)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          this.subsService.clearSelection();
          this.isDeleteModalOpen.set(false);
          this.subsService.subsResource.reload();
        },
        error: () => {
          this.deleteError.set(
            'No se pudieron eliminar las suscripciones seleccionadas.'
          );
        },
      });
  }
}
