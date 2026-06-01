import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import { Logs } from '../../interfaces/logs.interface';
@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);


  getLogs() {
    return this.http.get<Logs[]>(`${environment.apiUrl}/logs`);
  }


/*
  getLogsById(query: string) {


    return this.http.get<Logs>(`${environment.apiUrl}/logs/${query}`);
  }


  getUsersByName(query: string) {
    return this.http.get<User[]>(`${environment.apiUrl}/users/${query}`);
  }
*/

}
