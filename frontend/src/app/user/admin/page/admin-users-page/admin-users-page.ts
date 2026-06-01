import { Component, inject, signal, resource } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { AdminSearchInput } from '../../components/admin-search-input/admin-search-input';
import { AdminUsersList } from '../../components/admin-users-list/admin-users-list';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'admin-users-page',
  imports: [AdminUsersList, AdminSearchInput],
  templateUrl: './admin-users-page.html',
})
export class AdminUsersPage {
  adminService = inject(AdminService);
  query = signal('');


  usersResource = resource({
    params: () => ({ query: this.query() }),
    loader: async( { params } ) => {
      if(!params.query) return [];

      return await firstValueFrom(this.adminService.getUsersByName(params.query));
    }
  });




/*
  ngOnInit() {
    this.adminService.getUsers().subscribe({
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

