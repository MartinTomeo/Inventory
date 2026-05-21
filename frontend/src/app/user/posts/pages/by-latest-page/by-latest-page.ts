import { SearchInput } from '../../components/search-input/search-input';
import { PostService } from '../../services/post.service';
import { ByLatestTable } from './../../components/by-latest-table/by-latest-table';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'by-latest-page',
  imports: [ByLatestTable, SearchInput],
  templateUrl: './by-latest-page.html',
})
export class ByLatestPage {
  postsSerrvice = inject(PostService);
}
