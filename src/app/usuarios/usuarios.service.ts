import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { Usuario, UsuarioCreate, UsuarioUpdate, PaginatedResponse } from './usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private apiUrl = '/api/v1/usuarios';
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

  // Listar usuarios com paginacao
  listarUsuarios(page: number = 1, limit: number = 50): Observable<PaginatedResponse<Usuario>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<Usuario>>(this.apiUrl, {
      ...this.getHttpOptions(),
      params,
    });
  }

  // Obter usuario por ID
  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(
      `${this.apiUrl}/${id}`,
      this.getHttpOptions()
    );
  }

  // Criar novo usuario
  createUsuario(usuario: UsuarioCreate): Observable<Usuario> {
    return this.http.post<Usuario>(
      this.apiUrl,
      usuario,
      this.getHttpOptions()
    );
  }

  // Atualizar usuario
  updateUsuario(id: number, usuario: UsuarioUpdate): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${this.apiUrl}/${id}`,
      usuario,
      this.getHttpOptions()
    );
  }

  // Deletar usuario
  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      this.getHttpOptions()
    );
  }
}

// Servico de gestao de usuarios do sistema
// Apenas administradores tem acesso a essas funcionalidades
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
