import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { environment } from '@environments/environment.development';
import { catchError, map, of, throwError } from 'rxjs';
import { Stock, UpdateStockRequest, CreateStockRequest } from '../interfaces/stock.interface';
import { ApiResponse } from '../interfaces/api-response.interface';

export type StockFormMode = 'new' | 'edit';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private http = inject(HttpClient);

  query = signal('');
  formMode = signal<StockFormMode>('new');
  isNewMode = computed(() => this.formMode() === 'new');
  isEditMode = computed(() => this.formMode() === 'edit');
  selectedStockId = signal<number | null>(null);
  hasSelection = computed(() => this.selectedStockId() !== null);

  selectStock(id: number) {
    this.selectedStockId.set(id);
    this.formMode.set('edit');
  }

  newStock() {
    this.selectedStockId.set(null);
    this.formMode.set('new');
  }

  getStock() {
    return this.http
      .get<ApiResponse<Stock[]>>(`${environment.apiUrl}/stock`)
      .pipe(map((response) => response.data));
  }

  getStockById(id: number) {
    return this.http
      .get<ApiResponse<Stock>>(`${environment.apiUrl}/stock/${id}`)
      .pipe(map((response) => response.data));
  }

  getStockByLine(line: string) {
    return this.http
      .get<ApiResponse<Stock[]>>(
        `${environment.apiUrl}/stock/line/${encodeURIComponent(line.trim())}`
      )
      .pipe(map((response) => response.data));
  }

  postStock(stock: CreateStockRequest, photo?: File | null) {
    const formData = new FormData();

    formData.append('imei', stock.imei);
    formData.append('model', stock.model);
    formData.append('brand', stock.brand);
    formData.append('ph_provider', stock.ph_provider);
    formData.append('line', stock.line.toString());
    formData.append('line_provider', stock.line_provider);

    if (photo) {
      formData.append('photo', photo);
    }

    return this.http.post<ApiResponse<{ id: number }>>(`${environment.apiUrl}/stock`, formData);
  }

  updateStock(id: number, stock: UpdateStockRequest ) {
    return this.http.patch<ApiResponse<{ id: number; updated: string[] }>>(`${environment.apiUrl}/stock/${id}`, stock);
  }

  uploadStockPhoto(id: number, photo: File) {
    const formData = new FormData();

    formData.append('id', id.toString());
    formData.append('photo', photo);

    return this.http.post<ApiResponse<{ id: number; updated: string[]; image: string }>>(`${environment.apiUrl}/stock/photo`, formData);
  }

  deleteStock(idArray: number[]) {
    return this.http.delete(`${environment.apiUrl}/stock`, {
      body: { idArray },
    });
  }

  stockResource = rxResource({
    params: () => ({ query: this.query() }),
    defaultValue: [],
    stream: ({ params }) => {
      const query = params.query.trim();

      if (!query) {
        return this.getStock().pipe(
          catchError(() =>
            throwError(() => new Error('No hay elementos de stock disponibles.'))
          )
        );
      }

      return this.getStockByLine(query).pipe(
        catchError(() =>
          throwError(
            () => new Error('No hay elementos de stock que coincidan con la línea.')
          )
        )
      );
    },
  });

  selectedStockResource = rxResource<Stock | null, { id: number } | undefined>({
    params: () => {
      const id = this.selectedStockId();
      return id === null ? undefined : { id };
    },
    defaultValue: null,
    stream: ({ params }) => {
      if (!params) {
        return of(null);
      }

      return this.getStockById(params.id).pipe(
        catchError(() =>
          throwError(() => new Error('No se pudo obtener el stock seleccionado.'))
        )
      );
    },
  });
}
