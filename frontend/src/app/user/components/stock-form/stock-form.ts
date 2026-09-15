import { finalize, of, switchMap } from 'rxjs';
import { PhotoUtils } from '../../../shared/utils/photo-utils';
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
  isSaving = signal(false);
  isSubmited = signal(false);
  selectedPhoto = signal<File | null>(null);
  photoError = signal<string | null>(null);
  readonly photoAccept = PhotoUtils.accept;
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

  onPhotoSelected(event: Event): void {
    if (this.isSaving()) return;

    const selection = PhotoUtils.select(event);
    if (!selection) return;
    this.selectedPhoto.set(selection.photo);
    this.photoError.set(selection.error);
  }

  onSubmit() {
    if (this.isSaving()) return;

    this.hasFormError.set(false);
    this.isSubmited.set(true);

    const errors = this.evaluateFormErrors();
    this.submittedControlErrors.set(errors);

    if (this.stockForm.invalid || this.photoError()) {
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
    if (this.isSaving()) return;

    this.resetFormState();
    this.stockService.newStock();
    this.stockForm.reset({ imei: '', model: '', brand: '', ph_provider: '', line: '', line_provider: '' });
  }

  private createStock() {
    this.isSaving.set(true);
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
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.stockService.stockResource.reload();
          this.resetFormState();
          this.stockService.newStock();
          this.stockForm.reset({ imei: '', model: '', brand: '', ph_provider: '', line: '', line_provider: '' });
        },
        error: (error: HttpErrorResponse) => {
          this.showRequestError(error);
        },
      });
  }

  private updateStock() {
    const id = this.stockService.selectedStockId();

    if (id === null || this.isSaving()) return;

    const value = this.stockForm.getRawValue();
    const photo = this.selectedPhoto();
    const payload = {
      imei: value.imei,
      model: value.model,
      brand: value.brand,
      ph_provider: value.ph_provider,
      line: Number(value.line),
      line_provider: value.line_provider,
    };

    let dataSaved = false;
    this.isSaving.set(true);

    this.stockService.updateStock(id, payload).pipe(
      switchMap(() => {
        dataSaved = true;
        return photo
          ? this.stockService.uploadStockPhoto(id, photo)
          : of(null);
      }),
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: () => {
        // La lista puede cambiar de selección mientras se guarda.
        if (this.stockService.selectedStockId() !== id) {
          this.stockService.stockResource.reload();
          return;
        }
        this.reloadResources();
      },
      error: (error: HttpErrorResponse) => {
        if (dataSaved) {
          this.stockService.stockResource.reload();
        }
        if (this.stockService.selectedStockId() !== id) return;

        if (dataSaved && photo) {
          const message = PhotoUtils.uploadError(error.error?.error?.code);
          if (message) this.photoError.set(message);
          this.showFormError(
            'Los datos se guardaron, pero no se pudo subir la imagen.' +
            (message ? ` ${message}` : '')
          );
          return;
        }
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
    this.photoError.set(null);
    this.submittedControlErrors.set({});
    this.isSubmited.set(false);
    this.hasFormError.set(false);
  }

  private formErrorTimeout?: ReturnType<typeof setTimeout>;

  private showFormError(message: string) {
    if (this.formErrorTimeout !== undefined) {
      clearTimeout(this.formErrorTimeout);
    }
    this.formError.set(message);
    this.hasFormError.set(true);

    this.formErrorTimeout = setTimeout(() => {
      this.hasFormError.set(false);
    }, 2000);
  }

  private showRequestError(error: HttpErrorResponse) {
    const code = error.error?.error?.code;

    if (code === 'IMEI_ALREADY_EXISTS') {
      this.showFormError('Ya existe un equipo con ese IMEI.');
      return;
    }

    if (code === 'LINE_ALREADY_EXISTS') {
      this.showFormError('Ya existe un equipo con esa línea.');
      return;
    }

    // Un conflicto siempre se muestra como aviso general.
    if (error.status === 409) {
      this.showFormError('No se pudo guardar: hay datos repetidos o en conflicto.');
      return;
    }

    const photoMessage = PhotoUtils.uploadError(code);
    if (photoMessage) {
      this.photoError.set(photoMessage);
      return;
    }

    this.showFormError('No se pudo guardar. Intentá nuevamente.');
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

