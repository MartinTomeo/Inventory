import { Component, inject } from '@angular/core';
import { SearchInput } from '../../../shared/components/search-input/search-input';
import { StockForm } from '../../components/stock-form/stock-form';
import { StockList } from '../../components/stock-list/stock-list';
import { StockService } from '../../services/stock.service';

@Component({
  selector: 'stock-page',
  imports: [StockList, SearchInput, StockForm],
  templateUrl: './stock-page.html',
})
export class StockPage {
  stockService = inject(StockService);
}
