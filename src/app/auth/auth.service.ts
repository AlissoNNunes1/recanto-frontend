// src/app/auth/auth.service.ts

import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { from, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

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

      return this.http.post<any>('/api/v1/auth/login', body, { headers }).pipe(
        tap((response) => {
          if (this.isBrowser) {
            localStorage.setItem('token', response.token);
            if (response.newToken) {
              localStorage.setItem('newToken', response.newToken);
            }
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

      return this.http.post<any>('/api/v1/auth/login', body, { headers }).pipe(
        tap((response) => {
          if (this.isBrowser) {
            localStorage.setItem('token', response.token);
            if (response.newToken) {
              localStorage.setItem('newToken', response.newToken);
            }
          }
        }),
        catchError(this.handleError)
      );
    } else {
      return throwError('username e senha são necessários para login');
    }
  }

  get isAdmin(): boolean {
    if (!this.isBrowser) return false;
    return localStorage.getItem('role') === 'admin';
  }

  refreshToken(): Observable<any> {
    if (!this.isBrowser) {
      return throwError('localStorage not available in SSR');
    }
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
      .post<any>('/api/v1/auth/refresh-token', body.toString(), {
        headers,
      })
      .pipe(
        tap((response) => {
          if (this.isBrowser) {
            localStorage.setItem('token', response.token);
            if (response.newToken) {
              localStorage.setItem('newToken', response.newToken);
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('newToken');
    }
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
