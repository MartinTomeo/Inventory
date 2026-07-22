import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, ResourceRef, signal } from '@angular/core';
import { environment } from '@environments/environment.development';
import { User } from '../../interfaces/users.interface';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError } from 'rxjs/internal/operators/catchError';
import { rxResource } from '@angular/core/rxjs-interop';
@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  usersQuery = signal<string>('');
  selectedUserId = signal<number | null>(null);
  hasSelection = computed(() => this.selectedUserId() !== null);


  getUsers() {
    return this.http.get<User[]>(`${environment.apiUrl}/users`)
  }

  getUsersById(id: number) {

    return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
  }

  getUsersByName(query: string) {
    return this.http.get<User[]>(`${environment.apiUrl}/users/${query}`);
  }



  usersResource = rxResource({
    params: () => ({ query: this.usersQuery() }),
    defaultValue: [],
    stream: ({ params }) => {

      if (!params.query || params.query.trim() === '') return this.getUsers().pipe(
        catchError(() => {

          return throwError(() => new Error('No hay usuarios disponibles.'));
        })
      );

      return this.getUsersByName(params.query).pipe(
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
      return this.getUsersById(params.id).pipe(
        catchError(() =>
          throwError(() => new Error('No se pudo obtener el usuario seleccionado.'))
        )
      );
    }
  });


}
