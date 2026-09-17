import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {catchError, finalize, map, Observable, of, shareReplay, switchMap} from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { AuthUser } from '../interfaces/auth-user.interface';
import { CheckStatusResponse } from '../interfaces/check-status-response.interface';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);

  // Las peticiones de autenticación manejan sus propios errores
  // y envían explícitamente el token correspondiente.
  private sessionHttp = new HttpClient(inject(HttpBackend));

  private _token = signal<string | null>(localStorage.getItem('jwt'));
  private _currentUser = signal<AuthUser | null>(null);
  private _authStatus = signal<AuthStatus>(
    this._token() ? 'checking' : 'not-authenticated'
  );

  private sessionVersion = 0;

  private checkInProgress$: Observable<boolean> | null = null;

  authStatus = computed(() => this._authStatus());
  token = computed(() => this._token());
  currentUser = computed(() => this._currentUser());
  isAuthenticated = computed(() => this._authStatus() === 'authenticated');
  username = computed(() => this._currentUser()?.username ?? '');

  logoutError = signal<string | null>(null);

  // Permite identificar a qué sesión pertenece una petición.
  getSessionVersion(): number {
    return this.sessionVersion;
  }

  isCurrentSession(version: number): boolean {
    const token = this._token();

    return (
      version === this.sessionVersion &&
      token !== null &&
      localStorage.getItem('jwt') === token
    );
  }

  hasStoredToken(): boolean {
    return !!localStorage.getItem('jwt');
  }

  hasValidatedSession(): boolean {
    return (
      this.isAuthenticated() &&
      this.currentUser() !== null &&
      this.isCurrentSession(this.sessionVersion)
    );
  }

  login(email: string, password: string): Observable<boolean> {
    this.clearSession();
    this.logoutError.set(null);
    this._authStatus.set('checking');

    const version = this.sessionVersion;

    return this.sessionHttp
      .post<AuthResponse>(
        `${environment.apiUrl}/login`,
        { email, password }
      )
      .pipe(
        switchMap(response => {
          // Ignorar una respuesta posterior a un logout u otro login.
          if (
            version !== this.sessionVersion ||
            localStorage.getItem('jwt') !== null
          ) {
            return of(false);
          }

          this.saveToken(response.jwt);

          return this.checkStatus();
        }),
        catchError(() => {
          if (version === this.sessionVersion) {
            this.clearSession();
          }

          return of(false);
        })
      );
  }

  checkStatus(): Observable<boolean> {
    const token = localStorage.getItem('jwt');

    if (!token) {
      this.clearSession();
      return of(false);
    }

    // Si cambió el token desde otra pestaña, validar el estado recibido.
    if (this._token() !== token) {
      this.clearSession();
      this.saveToken(token);
    }

    if (this.checkInProgress$) {
      return this.checkInProgress$;
    }

    const version = this.sessionVersion;
    const previousStatus = this._authStatus();

    this._authStatus.set('checking');

    const request$ = this.sessionHttp
      .get<CheckStatusResponse>(
        `${environment.apiUrl}/checkStatus`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .pipe(
        map(response => {
          if (!this.isCurrentSession(version)) {
            return false;
          }

          this._currentUser.set(response.data.user);
          this._authStatus.set('authenticated');

          return true;
        }),
        catchError(error => {
          if (this.isCurrentSession(version)) {
            if (error.status === 401) {
              this.clearSession();
            } else {
              // No eliminar el token por un error temporal.
              this._authStatus.set(
                previousStatus === 'authenticated'
                  ? 'authenticated'
                  : 'not-authenticated'
              );
            }
          }

          return of(false);
        }),
        finalize(() => {
          if (this.checkInProgress$ === request$) {
            this.checkInProgress$ = null;
          }
        }),
        shareReplay({
          bufferSize: 1,
          refCount: false
        })
      );

    this.checkInProgress$ = request$;

    return request$;
  }

  logout(): void {
    const token = localStorage.getItem('jwt') ?? this._token();

    this.logoutError.set(null);
    this.clearSession();

    if (!token) return;

    const version = this.sessionVersion;

    this.sessionHttp
      .delete<{ success: boolean }>(
        `${environment.apiUrl}/login`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .subscribe({
        error: error => {
          if (
            error.status !== 401 &&
            version === this.sessionVersion &&
            !this.hasStoredToken()
          ) {
            this.logoutError.set(
              'Se cerró la sesión en este navegador, pero no se pudo ' +
              'confirmar su revocación en el servidor.'
            );
          }
        }
      });
  }

  invalidateLocalSession(): void {
    this.clearSession();
  }

  updateCurrentUser(user: AuthUser): void {
    // Evitar actualizar el usuario después de cerrar sesión.
    if (
      this.hasValidatedSession() &&
      this.currentUser()?.id === user.id
    ) {
      this._currentUser.set(user);
    }
  }

  private saveToken(token: string): void {
    this._token.set(token);
    localStorage.setItem('jwt', token);
  }

  private clearSession(): void {
    this.sessionVersion++;

    localStorage.removeItem('jwt');

    this._token.set(null);
    this._currentUser.set(null);
    this._authStatus.set('not-authenticated');

    this.checkInProgress$ = null;

  }
}
