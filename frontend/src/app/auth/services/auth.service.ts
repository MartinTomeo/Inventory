import {  computed, inject, Injectable, signal,} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, map, Observable, of, switchMap, tap,} from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { AuthUser } from '../interfaces/auth-user.interface';
import { CheckStatusResponse } from '../interfaces/check-status-response.interface';


type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private http = inject(HttpClient);
  private _authStatus = signal<AuthStatus>('checking');
  private _token = signal<string | null>(null);
  private _currentUser = signal<AuthUser | null>(null);


  authStatus = computed(() => this._authStatus());
  token = computed(() => this._token());
  currentUser = computed(() => this._currentUser());
  isAuthenticated = computed(() => this._authStatus() === 'authenticated');
  username = computed(() => this._currentUser()?.username ?? '');

  constructor() {

    if (!this._token()) {
      this._authStatus.set('not-authenticated');
    }

  }

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          this._token.set(response.jwt);
          localStorage.setItem('jwt', response.jwt);
        }),
        switchMap(() => this.checkStatus()),
        catchError(() => {
          this.clearSession();
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

    this._token.set(token);
    this._authStatus.set('checking');
    return this.http.get<CheckStatusResponse>(`${environment.apiUrl}/checkStatus`)
      .pipe(
        tap(response => {
          this._currentUser.set(
            response.data.user
          );
          this._authStatus.set(
            'authenticated'
          );
        }),
        map(() => true),
        catchError(() => {
          this.clearSession();
          return of(false);
        })
      );
  }


  logout(): void {

    this.clearSession();

  }

  private clearSession(): void {
    localStorage.removeItem('jwt');
    this._token.set(null);
    this._currentUser.set(null);
    this._authStatus.set('not-authenticated');

  }

  //para poder actualizarlo desde profile
  updateCurrentUser(user: AuthUser): void {
    this._currentUser.set(user);
  }

  hasStoredToken(): boolean {
    return !!localStorage.getItem('jwt');
  }


}
