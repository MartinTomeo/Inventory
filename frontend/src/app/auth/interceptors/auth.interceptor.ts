import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment.development';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.apiUrl.replace(/\/+$/, '');

  const isApiRequest =
    req.url === apiUrl ||
    req.url.startsWith(`${apiUrl}/`) ||
    req.url.startsWith(`${apiUrl}?`);

  if (!isApiRequest) {
    return next(req);
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('jwt');
  const version = authService.getSessionVersion();

  const requestUrl = req.url.split('?')[0].replace(/\/+$/, '');

  const isLoginRequest =
    req.method === 'POST' &&
    requestUrl === `${apiUrl}/login`;

  const authReq =
    token && !isLoginRequest
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        !isLoginRequest &&
        token !== null &&
        authService.token() === token &&
        authService.isCurrentSession(version)
      ) {
        authService.invalidateLocalSession();
        void router.navigateByUrl('/', { replaceUrl: true });
      }

      return throwError(() => error);
    })
  );
};
