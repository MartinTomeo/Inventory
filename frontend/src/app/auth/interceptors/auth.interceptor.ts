import { inject } from '@angular/core';

import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { Router } from '@angular/router';

import {
  catchError,
  switchMap,
  throwError
} from 'rxjs';

import { AuthService } from '../services/auth.service';

import { environment } from '../../../environments/environment';


export const authInterceptor:
  HttpInterceptorFn = (req, next) => {

  const authService =
    inject(AuthService);

  const router =
    inject(Router);


  const apiUrl =
    environment.apiUrl.replace(
      /\/+$/,
      ''
    );


  // -----------------------------------------
  // Solo nuestra API
  // -----------------------------------------

  const isApiRequest =
    req.url === apiUrl ||
    req.url.startsWith(`${apiUrl}/`) ||
    req.url.startsWith(`${apiUrl}?`);


  if (!isApiRequest) {

    return next(req);

  }


  // -----------------------------------------
  // Identificar endpoints auth
  // -----------------------------------------

  const requestUrl =
    req.url
      .split('?')[0]
      .replace(/\/+$/, '');


  const isLoginRequest =
    req.method === 'POST' &&
    requestUrl === `${apiUrl}/login`;


  const isRefreshRequest =
    req.method === 'POST' &&
    requestUrl === `${apiUrl}/refresh`;


  const isAuthRequest =
    isLoginRequest ||
    isRefreshRequest;


  // -----------------------------------------
  // Capturar contexto de autenticación
  // -----------------------------------------

  const authContext =
    authService.getAuthContext();


  const token =
    authContext.token;


  // -----------------------------------------
  // Agregar JWT
  // -----------------------------------------

  const authReq =
    token && !isAuthRequest

      ? req.clone({
          setHeaders: {
            Authorization:
              `Bearer ${token}`
          }
        })

      : req;


  // -----------------------------------------
  // Ejecutar request
  // -----------------------------------------

  return next(authReq).pipe(

    catchError(
      (error: HttpErrorResponse) => {


        // -------------------------------------
        // Solo tratamos 401
        // -------------------------------------

        if (error.status !== 401) {

          return throwError(
            () => error
          );

        }


        // -------------------------------------
        // Login y refresh no se refrescan
        // -------------------------------------

        if (isAuthRequest) {

          return throwError(
            () => error
          );

        }


        // -------------------------------------
        // Esta request pertenece a un contexto
        // de autenticación anterior.
        // -------------------------------------

        if (
          !authService.isAuthContextCurrent(
            authContext.generation
          )
        ) {

          return throwError(
            () => error
          );

        }


        // -------------------------------------
        // Verificar si otra request ya hizo
        // refresh mientras esta esperaba.
        // -------------------------------------

        const currentToken =
          authService.token();


        if (
          token &&
          currentToken &&
          currentToken !== token
        ) {

          const retryReq =
            req.clone({
              setHeaders: {
                Authorization:
                  `Bearer ${currentToken}`
              }
            });


          return next(retryReq);

        }


        // -------------------------------------
        // Hacer refresh
        // -------------------------------------

        return authService
          .refreshAccessToken()
          .pipe(

            switchMap(newToken => {


              if (!newToken) {

                if (!authService.token()) {

                  void router.navigateByUrl(
                    '/',
                    {
                      replaceUrl: true
                    }
                  );

                }


                return throwError(
                  () => error
                );

              }


              // ---------------------------------
              // Retry con JWT nuevo
              // ---------------------------------

              const retryReq =
                req.clone({
                  setHeaders: {
                    Authorization:
                      `Bearer ${newToken}`
                  }
                });


              return next(retryReq);

            })

          );

      }
    )

  );

};
