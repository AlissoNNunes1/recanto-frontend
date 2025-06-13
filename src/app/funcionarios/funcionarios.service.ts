import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  private apiUrl = 'http://localhost:3000/api/v1/funcionarios';

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    console.log('Chamando getHttpOptions'); // Verifica se a função está sendo chamada
    const token = localStorage.getItem('token');
    console.log(`Token: ${token}`); // Deve mostrar o token no console
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

  // Método de compatibilidade para código existente
  getFuncionarios(): Observable<Funcionario[]> {
    const filtros: FuncionarioFilterDto = {
      page: 1,
      limit: 100, // Buscar todos para compatibilidade
    };

    return new Observable((observer) => {
      this.listarFuncionarios(filtros).subscribe({
        next: (response) => {
          observer.next(response.data);
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
    return this.http.post<Funcionario>(
      this.apiUrl,
      funcionario,
      this.getHttpOptions()
    );
  }

  updateFuncionario(
    id: number,
    funcionario: FuncionarioUpdate
  ): Observable<Funcionario> {
    return this.http.put<Funcionario>(
      `${this.apiUrl}/${id}`,
      funcionario,
      this.getHttpOptions()
    );
  }

  deleteFuncionario(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      this.getHttpOptions()
    );
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
