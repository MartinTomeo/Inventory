import { Component, inject, signal } from '@angular/core';
import { Stock } from '../../interfaces/stock.interface';
import { StockService } from '../../services/stock.service';

@Component({
  selector: 'stock-list',
  imports: [],
  templateUrl: './stock-list.html',
  host: {class: 'block h-full'},
})
export class StockList {
  stockService = inject(StockService);

  stockToDelete = signal<Stock | null>(null);
  isDeleting = signal(false);
  deleteError = signal<string | null>(null);

  selectStock(id: number) {
    this.stockService.selectStock(id);
  }

  openDeleteModal(event: MouseEvent, stock: Stock) {
    event.stopPropagation();
    this.deleteError.set(null);
    this.stockToDelete.set(stock);
  }

  closeDeleteModal() {
    if (this.isDeleting()) {
      return;
    }

    this.stockToDelete.set(null);
    this.deleteError.set(null);
  }

  confirmDelete() {
    const stock = this.stockToDelete();

    if (!stock || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.deleteError.set(null);

    this.stockService.deleteStock([stock.id]).subscribe({
      next: () => {
        if (this.stockService.selectedStockId() === stock.id) {
          this.stockService.newStock();
        }

        this.stockService.stockResource.reload();
        this.isDeleting.set(false);
        this.stockToDelete.set(null);
      },
      error: () => {
        this.isDeleting.set(false);
        this.deleteError.set(
          'Could not delete the stock item. Please try again.'
        );
      },
    });
  }
}
