import { inject, Injectable, signal } from '@angular/core';
import { Logs } from '../interfaces/logs.interface';
import { environment } from '@environments/environment.development';
import { Observable } from 'rxjs/internal/Observable';
import { Subscriptions } from '../interfaces/subscriptions.interface';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class LogsService {
  private http = inject(HttpClient);
  query = signal<string>('');


  getLogs() {
    return this.http.get<Logs[]>(`${environment.apiUrl}/logs`);
  }

  getLogsByUsername(username: string) {
    return this.http.get<Logs[]>(`${environment.apiUrl}/logs/${username}`);
  }


  logsResource = rxResource({
    params: () => ({ query: this.query() }),
    defaultValue: [],
    stream: ({ params }) => {

      if (!params.query || params.query.trim() === '') return this.getLogs().pipe(
        catchError(() => {

          return throwError(() => new Error('No hay registros disponibles.'));
        })
      );

      return this.getLogsByUsername(params.query).pipe(
        catchError(() => {

          return throwError(() => new Error('No hay Logs que coincidan con la búsqueda.'));
        })
      );

    }
  });



}
