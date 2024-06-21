import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    // Construct URLSearchParams object
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    // Set headers for 'Content-Type' to 'application/x-www-form-urlencoded'
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<any>('http://localhost:8000/auth/token', body.toString(), { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('An error occurred:', error.error.message);
    } else {
      // Backend returned an unsuccessful response code
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // Return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }

  refreshToken(): Observable<any> {
    // Supondo que o token de refresh esteja armazenado em localStorage
    const refreshToken = localStorage.getItem('refresh_token');
    
    // Preparar o corpo da requisição. Isso pode variar dependendo de como seu backend espera receber os dados.
    const body = new URLSearchParams();
    if (refreshToken) {
      body.set('refresh_token', refreshToken);
    }
  
    // Definir headers, se necessário. Isso também pode variar.
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
  
    // Enviar a requisição para o endpoint de refresh token
    return this.http.post<any>('http://localhost:8000/auth/refresh_token', body.toString(), { headers })
      .pipe(
        catchError(this.handleError),
        tap((response: any) => {
          // Armazenar o novo token de acesso e atualizar o token de refresh, se necessário
          localStorage.setItem('access_token', response.access_token);
          if (response.refresh_token) {
            localStorage.setItem('refresh_token', response.refresh_token);
          }
        })
      );
  }
}