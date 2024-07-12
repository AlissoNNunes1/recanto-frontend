import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Funcionario, FuncionarioCreate, FuncionarioUpdate, Message } from './funcionario';

@Injectable({
  providedIn: 'root'
})
export class FuncionariosService {
  private apiUrl = 'http://192.168.0.169:3000/api/funcionarios';
  constructor(private http: HttpClient) { }

  private getHttpOptions() {
    console.log("Chamando getHttpOptions"); // Verifica se a função está sendo chamada
    const token = localStorage.getItem('token');
    console.log(`Token: ${token}`); // Deve mostrar o token no console
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return { headers };
  }
  atribuirUsuario(funcionarioId: number, usuario: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${funcionarioId}/atribuirusuario`, usuario, this.getHttpOptions());
  }


  getFuncionarios(): Observable<Funcionario[]> {
    return this.http.get<Funcionario[]>(this.apiUrl, this.getHttpOptions());
  }

  getUsuarioByFuncionarioId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/usuario`, this.getHttpOptions());
}


  getFuncionario(id: number): Observable<Funcionario> {
    return this.http.get<Funcionario>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  createFuncionario(funcionario: FuncionarioCreate): Observable<Funcionario> {
    return this.http.post<Funcionario>(this.apiUrl, funcionario, this.getHttpOptions());
  }

  updateFuncionario(id: number, funcionario: FuncionarioUpdate): Observable<Funcionario> {
    return this.http.put<Funcionario>(`${this.apiUrl}/${id}`, funcionario, this.getHttpOptions());
  }

  deleteFuncionario(id: number): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

}
