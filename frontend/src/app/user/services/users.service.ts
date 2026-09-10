import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment.development';
import { User, UpdateUserRequest, CreateUserRequest } from '../interfaces/users.interface';
import { catchError, throwError, of, map } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';
import { ApiResponse } from '../interfaces/api-response.interface';

export type UserFormMode = 'new' | 'edit';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  query = signal<string>('');
  formMode = signal<UserFormMode>('new');
  isNewMode = computed(() => this.formMode() === 'new');
  isEditMode = computed(() => this.formMode() === 'edit');
  selectedUserId = signal<number | null>(null);
  hasSelection = computed(() => this.selectedUserId() !== null);

  selectUser(id: number) {
    this.selectedUserId.set(id);
    this.formMode.set('edit');
  }

  newUser() {
    this.selectedUserId.set(null);
    this.formMode.set('new');
  }

  getUsers() {
    return this.http
      .get<ApiResponse<User[]>>(`${environment.apiUrl}/users`)
      .pipe(map((response) => response.data));
  }

  getUsersById(id: number) {
  return this.http
    .get<ApiResponse<User>>(
      `${environment.apiUrl}/users/${id}`
    )
    .pipe(map((response) => response.data));
}

  getUsersByName(query: string) {
  return this.http
    .get<ApiResponse<User[]>>(
      `${environment.apiUrl}/users/${query}`
    )
    .pipe(map((response) => response.data));
  }

  postUser(user: CreateUserRequest, photo?: File | null) {

    const formData = new FormData();

    formData.append('username', user.username);
    formData.append('email', user.email);
    formData.append('password', user.password);
    formData.append('role', user.role.toString());

    if (photo) {
      formData.append('photo', photo);
    }

    return this.http.post<ApiResponse<{id: number}>>(`${environment.apiUrl}/users`, formData);

  }



  updateUser(id: number, user: UpdateUserRequest) {

  return this.http.patch<ApiResponse<{ id: number; updated: string[] }>>(`${environment.apiUrl}/users/${id}`, user);

  }

  uploadUserPhoto(id: number, photo: File) {

    const formData = new FormData();

    formData.append('id', id.toString());
    formData.append('photo', photo);

    return this.http.post<ApiResponse<{ id: number; updated: string[]; image: string }>>(
      `${environment.apiUrl}/users/photo`,
      formData
    );
  }

  deleteUsers(idArray: number[]) {
    return this.http.delete<ApiResponse<{ deleted_count: number; ids: number[] }>>(`${environment.apiUrl}/users`, {
      body: { idArray },
    });
  }

  usersResource = rxResource({
    params: () => ({ query: this.query() }),
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

selectedUserResource = rxResource<User | null, { id: number } | undefined>({
  params: () => {
    const id = this.selectedUserId();

    return id === null ? undefined : { id };
  },

  defaultValue: null,

  stream: ({ params }) => {
    if (!params) {
      return of(null);
    }

    return this.getUsersById(params.id).pipe(
      catchError(() =>
        throwError(() => new Error('No se pudo obtener el usuario seleccionado.'))
      )
    );
  },
});




}
