import { Component, signal, inject, resource } from '@angular/core';
import { LogsList } from '../../components/logs-list/logs-list';
import { SearchInput } from '../../../../shared/components/search-input/search-input';
import { PostService } from '../../services/post.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs/internal/observable/throwError';

@Component({
  selector: 'app-logs-page',
  imports: [LogsList, SearchInput],
  templateUrl: './logs-page.html',
})
export class LogsPage {

  postsService = inject(PostService);

 }
