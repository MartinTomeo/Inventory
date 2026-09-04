import { Component, inject } from '@angular/core';
import { LogsService } from '../../../services/logs.service';
import { SearchInput } from '../../../../shared/components/search-input/search-input';
import { LogsList } from '../../components/logs-list/logs-list';


@Component({
  selector: 'app-logs-page',
  imports: [LogsList, SearchInput],
  templateUrl: './logs-page.html',
})
export class LogsPage {

  logsService = inject(LogsService);


 }
