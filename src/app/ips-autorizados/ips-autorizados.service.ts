import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { IPAutorizado, IPAutorizadoCreate, IPAutorizadoUpdate, PaginatedResponse } from './ip-autorizado';

@Injectable({
  providedIn: 'root',
})
export class IpsAutorizadosService {
  private apiUrl = '/api/v1/ips-autorizados';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getHttpOptions() {
    if (!this.isBrowser) {
      return { headers: new HttpHeaders() };
    }
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return { headers };
  }

  // Listar IPs autorizados com paginacao
  listarIPs(page: number = 1, limit: number = 50): Observable<PaginatedResponse<IPAutorizado>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<IPAutorizado>>(this.apiUrl, {
      ...this.getHttpOptions(),
      params,
    });
  }

  // Obter IP por ID
  getIP(id: number): Observable<IPAutorizado> {
    return this.http.get<IPAutorizado>(
      `${this.apiUrl}/${id}`,
      this.getHttpOptions()
    );
  }

  // Criar novo IP autorizado
  createIP(ip: IPAutorizadoCreate): Observable<IPAutorizado> {
    return this.http.post<IPAutorizado>(
      this.apiUrl,
      ip,
      this.getHttpOptions()
    );
  }

  // Atualizar IP autorizado
  updateIP(id: number, ip: IPAutorizadoUpdate): Observable<IPAutorizado> {
    return this.http.put<IPAutorizado>(
      `${this.apiUrl}/${id}`,
      ip,
      this.getHttpOptions()
    );
  }

  // Deletar IP autorizado
  deleteIP(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      this.getHttpOptions()
    );
  }
}

// Servico de gestao de IPs autorizados
// Apenas administradores tem acesso a essas funcionalidades
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
