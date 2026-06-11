import { Component, signal, inject, resource } from '@angular/core';
import { LogsList } from '../../components/logs-list/logs-list';
import { SearchInput } from '../../../../shared/components/search-input/search-input';
import { PostService } from '../../services/post.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Component({
  selector: 'app-logs-page',
  imports: [LogsList, SearchInput],
  templateUrl: './logs-page.html',
})
export class LogsPage {

  postsService = inject(PostService);
  query = signal('');


    logsResource = resource({
    params: () => ({ query: this.query() }),
    loader: async( { params } ) => {
      //if(!params.query) return firstValueFrom(this.postsService.getLogs()); TODO
      return await firstValueFrom(this.postsService.getLogs());
    }
  });




 }
