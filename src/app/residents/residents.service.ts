import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resident, ResidentCreate, ResidentUpdate, Message } from './resident';

@Injectable({
  providedIn: 'root'
})
export class ResidentsService {
  private apiUrl = 'http://192.168.0.169:3000/api/residentes';

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

  getResidents(): Observable<Resident[]> {
    return this.http.get<Resident[]>(this.apiUrl, this.getHttpOptions());
  }

  getResident(id: number): Observable<Resident> {
    return this.http.get<Resident>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  createResident(resident: ResidentCreate): Observable<Resident> {
    return this.http.post<Resident>(this.apiUrl, resident, this.getHttpOptions());
  }

  updateResident(id: number, resident: ResidentUpdate): Observable<Resident> {
    return this.http.put<Resident>(`${this.apiUrl}/${id}`, resident, this.getHttpOptions());
  }

  deleteResident(id: number): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }
}
