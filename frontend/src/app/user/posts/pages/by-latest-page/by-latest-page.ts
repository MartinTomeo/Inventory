import { SearchInput } from '../../components/search-input/search-input';
import { PostService } from '../../services/post.service';
import { Component, inject, resource, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NgClass } from "../../../../../../node_modules/@angular/common/types/_common_module-chunk";
import { ByLatestList } from '../../components/by-latest-list/by-latest-list';
import { User } from '../../interfaces/users.interface';

@Component({
  selector: 'by-latest-page',
  imports: [ByLatestList, SearchInput, ByLatestList],
  templateUrl: './by-latest-page.html',
})
export class ByLatestPage {
  postsService = inject(PostService);
  query = signal('');
  users = signal<User[]>([]);
/*
  postsResource = resource({
    params: () => ({ query: this.query() }),
    loader: async( { params } ) => {
      if(!params.query) return [];

      return await firstValueFrom(this.postsService.getUsersByName(params.query));
    }
  });

*/

  ngOnInit() {
    this.postsService.getUsers().subscribe({
      next: (data) => {
        console.log(data);
        this.users.set(data);
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        console.log('complete');
      }
    });
  }

/*
  searchById(query: string) {
    this.postsService.getUsersById(query).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        console.log('complete');
      }
    });
  }

  searchByName(query: string) {
    this.postsService.getUsersByName(query).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (err) => {
        console.log(err);
        console.log('error re cajetilla');
      },
      complete: () => {
        console.log('complete');
      }
    });
  }
*/

}
