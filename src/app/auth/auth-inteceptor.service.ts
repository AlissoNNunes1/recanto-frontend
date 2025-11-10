import { isPlatformBrowser } from '@angular/common';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let authReq = req;
    // Check if running in a browser environment
    if (this.isBrowser) {
      const token = localStorage.getItem('token');

      if (token) {
        authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`),
        });
      }
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Verifica se o erro é devido a um token expirado ou acesso proibido
        // Somente tenta refresh se estiver no browser (nao no SSR)
        if (
          this.isBrowser &&
          (error.status === 401 || error.status === 403) &&
          !authReq.url.includes('/refresh-token')
        ) {
          // Tenta obter um novo token
          return this.tryRefreshingTokens(authReq, next);
        }
        return throwError(error);
      })
    );
  }

  private tryRefreshingTokens(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.authService.refreshToken().pipe(
      switchMap((response: any) => {
        if (this.isBrowser) {
          localStorage.setItem('token', response.token);
        }
        // Repete a requisição original com o novo token
        const authReqRepeat = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${response.token}`),
        });
        return next.handle(authReqRepeat);
      }),
      catchError((err) => {
        // Se o refresh também falhar, redireciona para o login
        console.error('Error refreshing token or forbidden access', err);
        this.authService.logout(); // Limpa o armazenamento local e redireciona para o login
        return throwError(err);
      })
    );
  }
}
