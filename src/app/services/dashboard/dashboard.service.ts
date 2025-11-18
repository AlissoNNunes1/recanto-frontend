import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, map, shareReplay, tap } from 'rxjs';
import { AtividadeRecente, DashboardStats } from './dashboard';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private isBrowser: boolean;
  private dashboardCache$ = new BehaviorSubject<DashboardStats | null>(null);
  private cacheTime = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getHttpOptions() {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return { headers };
  }

  // Obter estatisticas do dashboard (com cache)
  getDashboardStats(): Observable<DashboardStats> {
    // Se temos cache valido, retornar do cache
    const agora = Date.now();
    const cached = this.dashboardCache$.getValue();
    
    if (cached && (agora - this.cacheTime) < this.CACHE_DURATION) {
      console.log('Retornando dashboard do cache');
      return this.dashboardCache$.asObservable().pipe(
        map(stats => stats!)
      );
    }

    console.log('Carregando dashboard da API (cache expirado ou primeira carga)');
    
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
      }),
      tap((stats) => {
        // Armazenar em cache
        this.dashboardCache$.next(stats);
        this.cacheTime = Date.now();
        console.log('Dashboard cacheado por 5 minutos');
      }),
      shareReplay(1) // Compartilhar resultado entre multiplos subscribers
    );
  }

  /**
   * Invalida cache manualmente (para apos criar/editar dados)
   */
  invalidateCache(): void {
    this.dashboardCache$.next(null);
    this.cacheTime = 0;
    console.log('Cache do dashboard invalidado');
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
// Agrega dados de multiplas APIs para estadisticas
// Cache de 5 minutos para melhor performance
// Usa token do AuthService ao inves de localStorage
