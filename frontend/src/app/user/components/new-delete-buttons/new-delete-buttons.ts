import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'new-delete-buttons',
  imports: [],
  templateUrl: './new-delete-buttons.html',
})
export class NewDeleteButtons {
  @Input() deleteDisabled = true;
  @Output() newSubscription = new EventEmitter<void>();
  @Output() deleteSelected = new EventEmitter<void>();
}
