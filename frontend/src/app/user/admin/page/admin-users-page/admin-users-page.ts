import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AdminService } from '../../services/admin.service';
import { AdminSearchInput } from '../../components/admin-search-input/admin-search-input';
import { AdminUsersList } from '../../components/admin-users-list/admin-users-list';
import { catchError } from 'rxjs/operators';
import { EMPTY, throwError } from 'rxjs';
import { AdminUsersForm } from '../../components/admin-users-form/admin-users-form';



@Component({
  selector: 'admin-users-page',
  imports: [AdminUsersList, AdminSearchInput, AdminUsersForm],
  templateUrl: './admin-users-page.html',
})
export class AdminUsersPage {

  adminService = inject(AdminService);
  query = signal<string>('');
  selectedUserId = signal<number | null>(null);
  hasSelection = computed(() => this.selectedUserId() !== null);


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

  selectedUserResource = rxResource({
    params: () => {
      const id = this.selectedUserId();

      return id === null
        ? undefined
        : { id };
    },
    stream: ({ params }) => {
      return this.adminService.getUsersById(params.id).pipe(
        catchError(() =>
          throwError(() => new Error('No se pudo obtener el usuario seleccionado.'))
        )
      );
    }
  });




}



