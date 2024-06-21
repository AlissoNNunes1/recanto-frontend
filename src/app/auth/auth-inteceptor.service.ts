import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;
    const token = localStorage.getItem('access_token');

    // Se o token existir, adicioná-lo ao header da requisição
    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    return next.handle(authReq).pipe(
      catchError(error => {
        // Se a requisição falhou devido a um token expirado
        if (error.status === 401 && !authReq.url.endsWith('/auth/token')) {
          // Tenta obter um novo token
          return this.authService.refreshToken().pipe(
            switchMap((token: any) => {
              localStorage.setItem('access_token', token.access_token);
              // Repete a requisição original com o novo token
              const headers = new HttpHeaders({
                'Authorization': `Bearer ${token.access_token}`
              });
              const authReqRepeat = req.clone({ headers });
              return next.handle(authReqRepeat);
            })
          );
        }
        return throwError(error);
      })
    );
  }
}