import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import { User } from '../../shared/interfaces/users.interface';
@Injectable({
  providedIn: 'root',
})
export class AdminService {
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
