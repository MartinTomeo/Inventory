import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AdminService } from '../../services/admin.service';
import { AdminSearchInput } from '../../components/admin-search-input/admin-search-input';
import { User } from './../../../interfaces/users.interface';
import { AdminUsersList } from '../../components/admin-users-list/admin-users-list';
import { catchError, debounceTime, delay, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';


@Component({
  selector: 'admin-users-page',
  imports: [AdminUsersList, AdminSearchInput],
  templateUrl: './admin-users-page.html',
})
export class AdminUsersPage {
  adminService = inject(AdminService);
  query = signal<string>('');



  usersResource = rxResource({
    params: () => ({ query: this.query() }),
    defaultValue: [],
    stream: ({ params }) => {

      if (!params.query || params.query.trim() === '') return this.adminService.getUsers().pipe(
        catchError(() => {

          return throwError(() => new Error('No hay usuarios disponibles.'));
        })
      );

      return this.adminService.getUsersByName(params.query).pipe(
        catchError(() => {

          return throwError(() => new Error('No hay usuarios que coincidan con la búsqueda.'));
        })
      );

    }
  });

}



/*
  /// funcion con promise

  usersResource = resource({
    params: () => ({ query: this.query() }),
    loader: async( { params } ) => {
      if(!params.query) return await firstValueFrom(this.adminService.getUsers());
      return await firstValueFrom(this.adminService.getUsersByName(params.query));
    }
  });


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


