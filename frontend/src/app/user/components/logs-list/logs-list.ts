import { Component, inject, input, ResourceRef } from '@angular/core';
import { LogsService } from '../../services/logs.service';
@Component({
  selector: 'logs-list',
  imports: [],
  templateUrl: './logs-list.html',
})
export class LogsList {

  logsService =inject(LogsService);


}
