// src/app/auth/auth.service.ts

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { from, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }

  getPublicIp(): Observable<string> {
    return from(
      fetch('https://api.ipify.org?format=json')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => data.ip)
    );
  }

  login(ip?: string, username?: string, senha?: string): Observable<any> {
    if (ip) {
      const body = { identificadorDispositivo: ip };
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
      });

      return this.http
        .post<any>('http://localhost:3000/api/v1/auth/login', body, { headers })
        .pipe(
          tap((response) => {
            localStorage.setItem('token', response.token);
            if (response.newToken) {
              localStorage.setItem('newToken', response.newToken);
            }
          }),
          catchError((error) => {
            if (error.status) {
              // IP não autorizado
              return throwError('IP não autorizado');
            }
            return this.handleError(error);
          })
        );
    } else if (username && senha) {
      const body = { username, senha };
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
      });

      return this.http
        .post<any>('http://localhost:3000/api/v1/auth/login', body, { headers })
        .pipe(
          tap((response) => {
            localStorage.setItem('token', response.token);
            if (response.newToken) {
              localStorage.setItem('newToken', response.newToken);
            }
          }),
          catchError(this.handleError)
        );
    } else {
      return throwError('username e senha são necessários para login');
    }
  }

  get isAdmin(): boolean {
    return localStorage.getItem('role') === 'admin';
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

    return this.http
      .post<any>(
        'http://localhost:3000/api/v1/auth/refresh-token',
        body.toString(),
        {
          headers,
        }
      )
      .pipe(
        tap((response) => {
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
