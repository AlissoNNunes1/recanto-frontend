import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import {
  CreateUsuarioForFuncionarioDto,
  Funcionario,
  FuncionarioCreate,
  FuncionarioFilterDto,
  FuncionarioUpdate,
  PaginatedResponseDto,
  Usuario,
} from './funcionario';

@Injectable({
  providedIn: 'root',
})
export class FuncionariosService {
  private apiUrl = '/api/v1/funcionarios';
  private isBrowser: boolean;

  // Cache em memoria com BehaviorSubject
  private cache$ = new BehaviorSubject<Funcionario[]>([]);
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
    if (!this.isBrowser) {
      return { headers: new HttpHeaders() };
    }
    // Usar token do AuthService (em memoria) ao invez de localStorage
    const token = this.authService.getToken();
    if (!token) {
      return { headers: new HttpHeaders() };
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return { headers };
  }

  // Método principal para listar funcionários com paginação
  listarFuncionarios(
    filtros: FuncionarioFilterDto
  ): Observable<PaginatedResponseDto<Funcionario>> {
    let params = new HttpParams();

    // Adicionar parâmetros de paginação
    params = params.set('page', filtros.page.toString());
    params = params.set('limit', filtros.limit.toString());

    // Adicionar filtros opcionais
    if (filtros.nome) {
      params = params.set('nome', filtros.nome);
    }
    if (filtros.cpf) {
      params = params.set('cpf', filtros.cpf);
    }
    if (filtros.funcao) {
      params = params.set('funcao', filtros.funcao);
    }
    if (filtros.turno) {
      params = params.set('turno', filtros.turno);
    }
    if (filtros.ordenarPor) {
      params = params.set('ordenarPor', filtros.ordenarPor);
    }
    if (filtros.ordenacao) {
      params = params.set('ordenacao', filtros.ordenacao);
    }

    return this.http.get<PaginatedResponseDto<Funcionario>>(this.apiUrl, {
      ...this.getHttpOptions(),
      params,
    });
  }

  // Metodo de compatibilidade para codigo existente com cache
  getFuncionarios(): Observable<Funcionario[]> {
    const agora = Date.now();

    // Se cache valido, retornar instantaneamente
    if (
      this.cache$.getValue().length &&
      agora - this.cacheTime < this.CACHE_DURATION
    ) {
      console.log('[FuncionariosService] Retornando do cache de memoria');
      return this.cache$.asObservable();
    }

    console.log(
      '[FuncionariosService] Fazendo requisicao nova (cache expirado)'
    );

    const filtros: FuncionarioFilterDto = {
      page: 1,
      limit: 100, // Buscar todos para compatibilidade
    };

    return new Observable((observer) => {
      this.listarFuncionarios(filtros)
        .pipe(
          map((response) => response.data),
          tap((data) => {
            // Atualizar cache em memoria
            this.cache$.next(data);
            this.cacheTime = Date.now();
            console.log('[FuncionariosService] Cache atualizado');
          }),
          shareReplay(1)
        )
        .subscribe({
          next: (funcionarios) => {
            observer.next(funcionarios);
            observer.complete();
          },
          error: (error) => observer.error(error),
        });
    });
  }

  getFuncionario(id: number): Observable<Funcionario> {
    return this.http.get<Funcionario>(
      `${this.apiUrl}/${id}`,
      this.getHttpOptions()
    );
  }

  createFuncionario(funcionario: FuncionarioCreate): Observable<Funcionario> {
    return this.http
      .post<Funcionario>(this.apiUrl, funcionario, this.getHttpOptions())
      .pipe(
        tap(() => this.invalidarCache()) // Invalidar cache ao criar
      );
  }

  updateFuncionario(
    id: number,
    funcionario: FuncionarioUpdate
  ): Observable<Funcionario> {
    return this.http
      .put<Funcionario>(
        `${this.apiUrl}/${id}`,
        funcionario,
        this.getHttpOptions()
      )
      .pipe(
        tap(() => this.invalidarCache()) // Invalidar cache ao atualizar
      );
  }

  deleteFuncionario(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(
        tap(() => this.invalidarCache()) // Invalidar cache ao deletar
      );
  }

  // Metodo para invalidar cache manualmente
  invalidarCache(): void {
    this.cache$.next([]);
    this.cacheTime = 0;
    console.log('[FuncionariosService] Cache invalidado');
  }

  // Atribuir usuário a funcionário
  atribuirUsuario(
    funcionarioId: number,
    dadosUsuario: CreateUsuarioForFuncionarioDto
  ): Observable<Usuario> {
    return this.http.post<Usuario>(
      `${this.apiUrl}/${funcionarioId}/atribuirusuario`,
      dadosUsuario,
      this.getHttpOptions()
    );
  }

  // Obter usuário do funcionário
  getUsuarioByFuncionarioId(
    funcionarioId: number
  ): Observable<Usuario & { senha?: string }> {
    return this.http.get<Usuario & { senha?: string }>(
      `${this.apiUrl}/${funcionarioId}/usuario`,
      this.getHttpOptions()
    );
  }

  // Contar total de funcionários
  contarTotal(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(
      `${this.apiUrl}/contar`,
      this.getHttpOptions()
    );
  }
}

// Serviço atualizado para adequação ao backend
// Inclui paginação, filtros e estruturas de resposta adequadas
// Mantém compatibilidade com código existente através de métodos wrapper
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
