import { Component, input } from '@angular/core';
import { Logs } from '../../../interfaces/logs.interface';
@Component({
  selector: 'logs-list',
  imports: [],
  templateUrl: './logs-list.html',
})
export class LogsList {

  logs =input.required<Logs[]>();

}
