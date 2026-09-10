import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '@environments/environment.development';
import { FormUtils } from '../../../shared/utils/form-utils';
import { StockService } from '../../services/stock.service';

@Component({
  selector: 'stock-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock-form.html',
  host: {
    class: 'block h-full',
  },
})
export class StockForm {
  private fb = inject(FormBuilder);

  stockService = inject(StockService);
  formUtils = FormUtils;
  isSubmited = signal(false);
  selectedPhoto = signal<File | null>(null);
  submittedControlErrors = signal<Record<string, string>>({});

  formError = signal('');
  hasFormError = signal(false);

  selectedStock = computed(() =>
    this.stockService.selectedStockResource.value()
  );

  imageUrl = computed(() => {
    const stock = this.selectedStock();

    if (!stock?.phone_image) {
      return null;
    }

    return `${environment.apiUrl}/uploads/stock/${stock.phone_image}`;
  });

  stockForm = this.fb.nonNullable.group({
    imei: [
      '',
      [
        Validators.required,
        Validators.minLength(15),
        Validators.maxLength(15),
        Validators.pattern(/^\d+$/),
      ],
    ],
    model: ['', [Validators.required]],
    brand: ['', [Validators.required]],
    ph_provider: ['', [Validators.required]],
    line: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    line_provider: ['', [Validators.required]],
  });

  constructor() {
    effect(() => {
      const mode = this.stockService.formMode();

      if (mode === 'new') {
        this.resetFormState();
        this.stockForm.reset({
          imei: '',
          model: '',
          brand: '',
          ph_provider: '',
          line: '',
          line_provider: '',
        });
        return;
      }

      const stock = this.selectedStock();

      if (!stock) {
        return;
      }

      this.resetFormState();
      this.stockForm.reset({
        imei: stock.imei,
        model: stock.model,
        brand: stock.brand,
        ph_provider: stock.ph_provider,
        line: stock.line.toString(),
        line_provider: stock.line_provider,
      });
    });
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.selectedPhoto.set(input.files[0]);
  }

  onSubmit() {
    this.hasFormError.set(false);
    this.isSubmited.set(true);

    const errors = this.evaluateFormErrors();
    this.submittedControlErrors.set(errors);

    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }

    if (this.stockService.formMode() === 'new') {
      this.createStock();
      return;
    }

    this.updateStock();
  }

  clearForm() {
    this.resetFormState();
    this.stockService.newStock();
  }

  private createStock() {
    const value = this.stockForm.getRawValue();

    this.stockService
      .postStock(
        {
          imei: value.imei,
          model: value.model,
          brand: value.brand,
          ph_provider: value.ph_provider,
          line: Number(value.line),
          line_provider: value.line_provider,
        },
        this.selectedPhoto()
      )
      .subscribe({
        next: () => {
          this.stockService.stockResource.reload();
          this.resetFormState();
          this.stockService.newStock();
        },
        error: (error: HttpErrorResponse) => {
          this.showRequestError(error);
        },
      });
  }

  private updateStock() {
    const id = this.stockService.selectedStockId();

    if (id === null) {
      return;
    }

    const value = this.stockForm.getRawValue();

    this.stockService
      .updateStock(id, {
        imei: value.imei,
        model: value.model,
        brand: value.brand,
        ph_provider: value.ph_provider,
        line: Number(value.line),
        line_provider: value.line_provider,
      })
      .subscribe({
        next: () => {
          const photo = this.selectedPhoto();

          if (!photo) {
            this.reloadResources();
            return;
          }

          this.stockService.uploadStockPhoto(id, photo).subscribe({
            next: () => {
              this.reloadResources();
            },
            error: () => {
              this.reloadResources();
              this.showFormError(
                'The stock item was updated, but its image could not be uploaded.'
              );
            },
          });
        },
        error: (error: HttpErrorResponse) => {
          this.showRequestError(error);
        },
      });
  }

  private reloadResources() {
    this.stockService.stockResource.reload();
    this.stockService.selectedStockResource.reload();
    this.resetFormState();
  }

  private resetFormState() {
    this.selectedPhoto.set(null);
    this.submittedControlErrors.set({});
    this.isSubmited.set(false);
    this.hasFormError.set(false);
  }

  private showFormError(message: string) {
    this.formError.set(message);
    this.hasFormError.set(true);

    setTimeout(() => {
      this.hasFormError.set(false);
    }, 2000);
  }

  private showRequestError(error: HttpErrorResponse) {
    const code = error.error?.error?.code;

    if (code === 'IMEI_ALREADY_EXISTS') {
      this.showFormError('A stock item with that IMEI already exists.');
      return;
    }

    if (code === 'LINE_ALREADY_EXISTS') {
      this.showFormError('A stock item with that line already exists.');
      return;
    }

    this.showFormError('The stock item could not be saved. Please try again.');
  }

  private evaluateFormErrors(): Record<string, string> {
    const errors: Record<string, string> = {};

    for (const fieldName of Object.keys(this.stockForm.controls)) {
      const error = FormUtils.getFieldError(this.stockForm, fieldName);

      if (error) {
        errors[fieldName] = error;
      }
    }

    return errors;
  }
}
