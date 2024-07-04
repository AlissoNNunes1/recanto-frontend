import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import jsonp from 'jsonp';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) {}

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }

  getPublicIp(): Observable<string> {
    return from(fetch('https://api.ipify.org?format=json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => data.ip));
  }

  login(): Observable<any> {
    return this.getPublicIp().pipe(
      switchMap(ip => {
        const body = { identificadorDispositivo: ip };
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
        });

        return this.http.post<any>('http://192.168.0.169:3000/api/login', body, { headers }).pipe(
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

    return this.http.post<any>('http://192.168.0.169:3000/api/refresh-token', body.toString(), { headers }).pipe(
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
