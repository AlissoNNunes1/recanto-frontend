import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) {}

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }

  login(): Observable<any> {
    // Obter o IP do cliente usando um serviço externo
    return this.http.get<{ ip: string }>('https://api.ipify.org/?format=json').pipe(
      switchMap(({ ip }) => {
        const body = { identificadorDispositivo: ip };
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
        });

        // Fazer a solicitação de login com o identificadorDispositivo (IP)
        return this.http.post<any>('http://localhost:3000/api/login', body, { headers }).pipe(
          tap(response => {
            localStorage.setItem('token', response.token);
            if (response.newToken) {
              localStorage.setItem('newToken', response.newToken);
            }
          }),
          catchError(this.handleError)
        );
      }),
      catchError(this.handleError)
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('newToken');
    if (!refreshToken) {
      return throwError('No refresh token available');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams();
    body.set('token', refreshToken);

    return this.http.post<any>('http://localhost:3000/api/refresh-token', body.toString(), { headers }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        if (response.newToken) {
          localStorage.setItem('newToken', response.newToken);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('newToken');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
