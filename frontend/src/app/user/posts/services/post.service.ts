import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment.development';
import { User } from '../interfaces/users.interface';
@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);


  getUsers() {
    return this.http.get<User[]>(`${environment.apiUrl}/users`)
  }

  getUsersById(query: string) {


    return this.http.get<User>(`${environment.apiUrl}/users/${query}`);
  }


  getUsersByName(query: string) {
    return this.http.get<User[]>(`${environment.apiUrl}/users/${query}`);
  }


}
