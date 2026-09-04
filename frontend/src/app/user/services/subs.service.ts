import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment.development';
import { Subscriptions } from '../interfaces/subscriptions.interface';
import { throwError, catchError, of, shareReplay, Observable} from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';


@Injectable({
  providedIn: 'root',
})
export class SubsService {
  private http = inject(HttpClient);
  query = signal<string>('');
  queryCacheSubscriptions = new Map<string, Observable<Subscriptions[]>>();


  getSubscriptions():Observable<Subscriptions[]> {
    return this.http.get<Subscriptions[]>(`${environment.apiUrl}/subscriptions`);
  }

  getSubscriptionsById(id: number): Observable<Subscriptions[]> {
    return this.http.get<Subscriptions[]>(`${environment.apiUrl}/subscriptions/${id}`);
  }

  getSubscriptionsByUsername(username: string): Observable<Subscriptions[]> {
    return this.http.get<Subscriptions[]>(`${environment.apiUrl}/subscriptions/${username}`);
  }

  subsResource = rxResource<Subscriptions[], { query: string }>({
    params: () => ({ query: this.query() }),
    defaultValue: [],
    stream: ({ params }) => {

      const query = params.query.trim().toLowerCase();
      const cached = this.queryCacheSubscriptions.get(query);

      if (cached) {
        return cached;
      }

      const request$ = (
        !query
          ? this.getSubscriptions()
          : this.getSubscriptionsByUsername(query)
      ).pipe(
        shareReplay(1),
        catchError(() => {
          this.queryCacheSubscriptions.delete(query);
          return throwError(() =>
            new Error(
              query
                ? 'No hay usuarios que coincidan con la búsqueda.'
                : 'No hay registros disponibles.'
            )
          );
        })
      );


      this.queryCacheSubscriptions.set(query, request$);
      return request$;

    }
  });

}
