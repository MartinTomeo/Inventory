import { Component, input, output } from '@angular/core';

@Component({
  selector: 'admin-search-input',
  imports: [],
  templateUrl: './admin-search-input.html',
})
export class AdminSearchInput {
  placeholder = input<string>('error');
  value = output<string>();
}
