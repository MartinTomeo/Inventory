import { Component, signal, inject } from '@angular/core';
import { LogsList } from '../../components/logs-list/logs-list';
import { SearchInput } from '../../../../shared/components/search-input/search-input';
import { Logs } from '../../../interfaces/logs.interface';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-logs-page',
  imports: [LogsList, SearchInput],
  templateUrl: './logs-page.html',
})
export class LogsPage {

  postsService = inject(PostService);
  query = signal('');
  logs = signal<Logs[]>([]);

    ngOnInit() {
    this.postsService.getLogs().subscribe({
      next: (data) => {
        console.log(data);
        this.logs.set(data);
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        console.log('complete');
      }
    });
  }


 }
