import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Message,
  PaginatedResponse,
  Resident,
  ResidentCreate,
  ResidentUpdate,
} from './resident';

@Injectable({
  providedIn: 'root',
})
export class ResidentsService {
  private apiUrl = '/api/v1/residentes';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getHttpOptions() {
    console.log('Chamando getHttpOptions');
    if (!this.isBrowser) {
      return { headers: new HttpHeaders() };
    }
    const token = localStorage.getItem('token');
    console.log(`Token: ${token}`);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return { headers };
  }

  // Método atualizado para trabalhar com paginação
  getResidents(page: number = 1, limit: number = 50): Observable<Resident[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http
      .get<PaginatedResponse<Resident>>(this.apiUrl, {
        ...this.getHttpOptions(),
        params,
      })
      .pipe(
        map((response) => response.data) // Extrair apenas os dados do array
      );
  }

  // Método para obter resposta completa com paginação
  getResidentsPaginated(
    page: number = 1,
    limit: number = 50
  ): Observable<PaginatedResponse<Resident>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<Resident>>(this.apiUrl, {
      ...this.getHttpOptions(),
      params,
    });
  }

  getResident(id: number): Observable<Resident> {
    return this.http.get<Resident>(
      `${this.apiUrl}/${id}`,
      this.getHttpOptions()
    );
  }

  createResident(resident: ResidentCreate): Observable<Resident> {
    return this.http.post<Resident>(
      this.apiUrl,
      resident,
      this.getHttpOptions()
    );
  }

  updateResident(id: number, resident: ResidentUpdate): Observable<Resident> {
    return this.http.put<Resident>(
      `${this.apiUrl}/${id}`,
      resident,
      this.getHttpOptions()
    );
  }

  deleteResident(id: number): Observable<Message> {
    return this.http.delete<Message>(
      `${this.apiUrl}/${id}`,
      this.getHttpOptions()
    );
  }
}

// Serviço atualizado para trabalhar com paginação do backend
// Configurado para extrair dados corretos da resposta paginada
// Mantém compatibilidade com frontend existente
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
