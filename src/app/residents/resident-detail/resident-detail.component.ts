import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Resident } from '../resident';
import { ResidentsService } from '../residents.service';

@Component({
  selector: 'app-resident-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, MatButtonModule, MatIconModule],
  templateUrl: './resident-detail.component.html',
  styleUrls: ['./resident-detail.component.css'],
})
export class ResidentDetailComponent implements OnInit {
  resident!: Resident;

  constructor(
    private route: ActivatedRoute,
    private residentsService: ResidentsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const residentId = Number(this.route.snapshot.paramMap.get('id'));
    if (residentId) {
      this.getResidentDetails(residentId);
    }
  }

  /**
   * Busca detalhes do residente
   */
  getResidentDetails(id: number): void {
    this.residentsService.getResident(id).subscribe({
      next: (resident) => {
        this.resident = resident;
      },
      error: (error) => {
        console.error('Erro ao buscar residente:', error);
        // Opcional: mostrar mensagem de erro ou redirecionar
      },
    });
  }

  /**
   * Navega de volta para lista de residentes
   */
  goBack(): void {
    this.router.navigate(['/residents']);
  }

  /**
   * Navega para criacao de prontuario
   */
  createProntuario(): void {
    if (this.resident) {
      this.router.navigate(['/prontuario/create', this.resident.id]);
    }
  }

  /**
   * Formata CPF para exibição
   */
  formatCpf(cpf: string): string {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formata telefone para exibição
   */
  formatPhone(phone: string): string {
    if (!phone) return '';
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  }
}

// Componente de detalhes do residente com formatação adequada
// Configurado para acessibilidade e responsividade
// Inclui tratamento de erros e navegação otimizada
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
