import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { AtividadeRecente, DashboardStats } from './dashboard';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
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

  // Obter estatisticas do dashboard
  getDashboardStats(): Observable<DashboardStats> {
    const options = this.getHttpOptions();

    // Criar parametros de query para cada endpoint
    // Usar 50 itens para evitar problemas com limite do backend (max 100)
    const limiteAlto = new HttpParams().set('limit', '50');
    const limiteBaixo = new HttpParams().set('limit', '20');

    // Fazer chamadas paralelas para todas as APIs
    return forkJoin({
      residentes: this.http.get<any>('/api/v1/residentes', {
        ...options,
        params: limiteAlto,
      }),
      funcionarios: this.http.get<any>('/api/v1/funcionarios', {
        ...options,
        params: limiteAlto,
      }),
      usuarios: this.http.get<any>('/api/v1/usuarios', {
        ...options,
        params: limiteAlto,
      }),
      ips: this.http.get<any>('/api/v1/ips-autorizados', {
        ...options,
        params: limiteAlto,
      }),
      auditoria: this.http.get<any>('/api/v1/logs/auditoria', {
        ...options,
        params: limiteBaixo,
      }),
    }).pipe(
      map((responses) => {
        const stats: DashboardStats = {
          totalResidentes:
            responses.residentes.pageInfo?.totalItems ||
            responses.residentes.data?.length ||
            0,
          totalFuncionarios:
            responses.funcionarios.pageInfo?.totalItems ||
            responses.funcionarios.data?.length ||
            0,
          totalUsuarios:
            responses.usuarios.pageInfo?.totalItems ||
            responses.usuarios.data?.length ||
            0,
          totalIPsAutorizados:
            responses.ips.pageInfo?.totalItems ||
            responses.ips.data?.length ||
            0,
          residentes: {
            ativos: this.contarAtivos(responses.residentes.data),
            inativos: this.contarInativos(responses.residentes.data),
            recentes: this.contarRecentes(responses.residentes.data),
          },
          funcionarios: {
            ativos: this.contarAtivos(responses.funcionarios.data),
            inativos: this.contarInativos(responses.funcionarios.data),
            recentes: this.contarRecentes(responses.funcionarios.data),
          },
          auditoria: {
            totalLogs: responses.auditoria.pageInfo?.totalItems || 0,
            logsPorAcao: this.contarLogsPorAcao(responses.auditoria.data),
            ultimasAtividades: this.mapearAtividades(responses.auditoria.data),
          },
        };
        return stats;
      })
    );
  }

  private contarAtivos(items: any[]): number {
    if (!items) return 0;
    return items.filter((item) => item.ativo === true).length;
  }

  private contarInativos(items: any[]): number {
    if (!items) return 0;
    return items.filter((item) => item.ativo === false).length;
  }

  private contarRecentes(items: any[]): number {
    if (!items) return 0;
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);
    return items.filter((item) => new Date(item.createdAt) >= dataLimite)
      .length;
  }

  private contarLogsPorAcao(logs: any[]): { [key: string]: number } {
    if (!logs) return {};
    const contagem: { [key: string]: number } = {};
    logs.forEach((log) => {
      const acao = log.acao || 'UNKNOWN';
      contagem[acao] = (contagem[acao] || 0) + 1;
    });
    return contagem;
  }

  private mapearAtividades(logs: any[]): AtividadeRecente[] {
    if (!logs) return [];
    return logs.slice(0, 10).map((log) => ({
      id: log.id,
      usuario: log.usuario?.nome || log.username || 'Sistema',
      acao: log.acao,
      recurso: log.recurso || 'Sistema',
      timestamp: log.timestamp,
      ip: log.detalhes?.ipOrigem || 'N/A',
    }));
  }
}

// Servico de dashboard administrativo
// Agrega dados de multiplas APIs para estatisticas
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
