import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { LogAuditoria, FiltrosAuditoria, PaginatedResponse } from './log-auditoria';

@Injectable({
  providedIn: 'root',
})
export class AuditoriaService {
  private apiUrl = '/api/v1/logs/auditoria';
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

  // Listar logs de auditoria com filtros e paginacao
  listarLogs(filtros: FiltrosAuditoria = {}): Observable<PaginatedResponse<LogAuditoria>> {
    let params = new HttpParams();

    if (filtros.usuarioId) {
      params = params.set('usuarioId', filtros.usuarioId.toString());
    }
    if (filtros.acao) {
      params = params.set('acao', filtros.acao);
    }
    if (filtros.recurso) {
      params = params.set('recurso', filtros.recurso);
    }
    if (filtros.dataInicio) {
      params = params.set('dataInicio', filtros.dataInicio);
    }
    if (filtros.dataFim) {
      params = params.set('dataFim', filtros.dataFim);
    }
    if (filtros.ip) {
      params = params.set('ip', filtros.ip);
    }
    if (filtros.page) {
      params = params.set('page', filtros.page.toString());
    }
    if (filtros.limit) {
      params = params.set('limit', filtros.limit.toString());
    }

    return this.http.get<PaginatedResponse<LogAuditoria>>(this.apiUrl, {
      ...this.getHttpOptions(),
      params,
    });
  }

  // Obter log por ID
  getLog(id: number): Observable<LogAuditoria> {
    return this.http.get<LogAuditoria>(
      `${this.apiUrl}/${id}`,
      this.getHttpOptions()
    );
  }

  // Exportar logs em formato CSV
  exportarLogs(filtros: FiltrosAuditoria = {}): Observable<Blob> {
    let params = new HttpParams();

    if (filtros.usuarioId) {
      params = params.set('usuarioId', filtros.usuarioId.toString());
    }
    if (filtros.acao) {
      params = params.set('acao', filtros.acao);
    }
    if (filtros.recurso) {
      params = params.set('recurso', filtros.recurso);
    }
    if (filtros.dataInicio) {
      params = params.set('dataInicio', filtros.dataInicio);
    }
    if (filtros.dataFim) {
      params = params.set('dataFim', filtros.dataFim);
    }

    return this.http.get(`${this.apiUrl}/export`, {
      ...this.getHttpOptions(),
      params,
      responseType: 'blob',
    });
  }
}

// Servico de auditoria para visualizacao de logs
// Apenas administradores tem acesso
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
