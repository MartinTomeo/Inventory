import {
  computed,
  inject,
  Injectable,
  signal
} from '@angular/core';

import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError
} from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { AuthResponse } from '../interfaces/auth-response.interface';
import { AuthUser } from '../interfaces/auth-user.interface';
import { CheckStatusResponse } from '../interfaces/check-status-response.interface';


interface RefreshResponse {
  success: boolean;
  jwt: string;
}

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // HttpClient que no pasa por los interceptores.
  private authHttp = new HttpClient(inject(HttpBackend));

  private _token = signal<string | null>(localStorage.getItem('jwt'));

  private _currentUser = signal<AuthUser | null>(null);

  private _authStatus = signal<AuthStatus>( this._token() ? 'checking' : 'not-authenticated' );

  // Mientras haya un refresh ejecutándose,
  // todos los consumidores comparten este Observable.
  private refreshInProgress$: Observable<string | null> | null = null;

  private authGeneration = 0;
  private isLoggingOut = false;


  authStatus = computed(() => this._authStatus());


  token = computed(() => this._token());


  currentUser = computed(() => this._currentUser());


  isAuthenticated = computed( () => this._authStatus() === 'authenticated' );

  username = computed( () => this._currentUser()?.username ?? '' );

  logoutError = signal<string | null>(null);

  login( email: string, password: string ): Observable<boolean> {

    this.isLoggingOut = false;
    this.clearAuth();
    this.logoutError.set(null);
    this._authStatus.set('checking');

    return this.authHttp.post<AuthResponse>(`${environment.apiUrl}/login`, { email, password }, { withCredentials: true })
      .pipe(
        tap(response => {
          this.saveAccessToken( response.jwt );
      }),
        switchMap(() => this.checkStatus()
      ),
        catchError(() => {
          this.clearAuth();
          return of(false);
      })

    );
  }


  checkStatus(): Observable<boolean> {

    const token = this._token() ?? localStorage.getItem('jwt');

    this._authStatus.set('checking');

    if (!token) {
      return this.refreshAndLoadUser();
    }


    return this.loadCurrentUser(token)
      .pipe(
        catchError(
          (error: HttpErrorResponse) => {
            if (error.status === 401) {
              return this.refreshAndLoadUser();
            }
            this._authStatus.set('not-authenticated');
            return of(false);
          }
        )
      );
  }


  refreshAccessToken(): Observable<string | null> {
    if (this.isLoggingOut) {
      return of(null);
    }

    if (this.refreshInProgress$) {
      return this.refreshInProgress$;
    }

    const generation = this.authGeneration;

    const request$ = this.authHttp.post<RefreshResponse>(`${environment.apiUrl}/refresh`, {}, { withCredentials: true })
    .pipe(
        map(response => {

          if (generation !== this.authGeneration) {
            return null;
          }

          this.saveAccessToken(response.jwt);
          return response.jwt;

        }),
        catchError(
          (error: HttpErrorResponse) => {

            if (generation !== this.authGeneration) {
              return of(null);
            }

            if (error.status === 401) {
              this.clearAuth();
              return of(null);
            }
            return throwError(() => error);

          }
        ),
        finalize(() => {
          if ( this.refreshInProgress$ === request$) {
            this.refreshInProgress$ = null;
          }
        }),
        shareReplay({bufferSize: 1, refCount: false})
      );


  this.refreshInProgress$ = request$;
  return request$;

}


logout(): void {

  this.logoutError.set(null);

  this.isLoggingOut = true;

  this.clearAuth();


  this.authHttp
    .delete<{ success: boolean }>(`${environment.apiUrl}/login`, { withCredentials: true })
      .subscribe({
        error: () => {
          this.logoutError.set( 'Se cerró la sesión en este navegador, ' + 'pero no se pudo revocar el refresh token en el servidor.');
        }
      });

  }

  updateCurrentUser( user: AuthUser ): void {

    if ( this.isAuthenticated() && this.currentUser()?.id === user.id ) {
      this._currentUser.set(user);
    }

  }


  clearAuth(): void {

    this.authGeneration++;
    this.refreshInProgress$ = null;
    localStorage.removeItem('jwt');
    this._token.set(null);
    this._currentUser.set(null);
    this._authStatus.set('not-authenticated');

}


  private loadCurrentUser( token: string ): Observable<boolean> {

    return this.authHttp
      .get<CheckStatusResponse>(
        `${environment.apiUrl}/checkStatus`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )
      .pipe(
        map(response => {
          this._currentUser.set(response.data.user);
          this._authStatus.set('authenticated');
          return true;
        })
      );
  }


  private refreshAndLoadUser(): Observable<boolean> {
    return this.refreshAccessToken().pipe(
        switchMap(newToken => {
          if (!newToken) {
            this._authStatus.set('not-authenticated');
            return of(false);
          }
          return this.loadCurrentUser(newToken)
            .pipe(
              catchError(() => {
                this.clearAuth();
                return of(false);
              })
            );
        }),
        catchError(() => {
          this._authStatus.set('not-authenticated');
          return of(false);
        })
      );
  }

  // -----------------------------------------
  // GUARDAR ACCESS TOKEN
  // -----------------------------------------

  private saveAccessToken( token: string ): void {
    this._token.set(token);
    localStorage.setItem('jwt', token);
  }

  getAuthContext(): { token: string | null; generation: number; } {
    return {
      token: this._token(),
      generation: this.authGeneration
      };
  }


  isAuthContextCurrent(generation: number): boolean {
    return ( generation === this.authGeneration );
  }

  hasAccessToken(): boolean {
    return this._token() !== null;
  }

}
