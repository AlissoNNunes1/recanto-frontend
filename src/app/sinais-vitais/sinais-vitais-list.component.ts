import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { ResidentsService } from '../residents/residents.service';
import {
  SinaisVitaisFiltros,
  SinaisVitaisService,
  SinalVital,
} from '../services/sinais-vitais.service';

@Component({
  selector: 'app-sinais-vitais-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    RouterModule,
  ],
  templateUrl: './sinais-vitais-list.component.html',
  styleUrl: './sinais-vitais-list.component.css',
})
export class SinaisVitaisListComponent implements OnInit {
  displayedColumns: string[] = [
    'dataMedicao',
    'residente',
    'pressao',
    'temperatura',
    'frequenciaCardiaca',
    'saturacaoOxigenio',
    'acoes',
  ];

  sinaisVitais: SinalVital[] = [];
  residentes: any[] = [];
  loading = false;
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  filtros: SinaisVitaisFiltros = {
    page: 1,
    limit: 10,
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private sinaisVitaisService: SinaisVitaisService,
    private residentsService: ResidentsService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarResidentes();
    this.carregarSinaisVitais();
  }

  carregarResidentes(): void {
    this.residentsService.getResidents().subscribe({
      next: (response: any) => {
        this.residentes = response.data || response || [];
      },
      error: (error) => {
        console.error('Erro ao carregar residentes:', error);
      },
    });
  }

  carregarSinaisVitais(): void {
    this.loading = true;
    this.sinaisVitaisService.listar(this.filtros).subscribe({
      next: (response) => {
        this.sinaisVitais = response.data;
        this.totalItems = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar sinais vitais:', error);
        this.snackBar.open('Erro ao carregar sinais vitais', 'Fechar', {
          duration: 3000,
        });
        this.loading = false;
      },
    });
  }

  aplicarFiltros(): void {
    this.filtros.page = 1;
    this.pageIndex = 0;
    this.carregarSinaisVitais();
  }

  limparFiltros(): void {
    this.filtros = {
      page: 1,
      limit: 10,
    };
    this.pageIndex = 0;
    this.carregarSinaisVitais();
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.filtros.page = event.pageIndex + 1;
    this.filtros.limit = event.pageSize;
    this.carregarSinaisVitais();
  }

  formatarPressao(sinalVital: SinalVital): string {
    if (sinalVital.pressaoSistolica && sinalVital.pressaoDiastolica) {
      return `${sinalVital.pressaoSistolica}/${sinalVital.pressaoDiastolica}`;
    }
    return '-';
  }

  formatarTemperatura(temperatura?: number): string {
    return temperatura ? `${temperatura.toFixed(1)} C` : '-';
  }

  formatarFrequencia(frequencia?: number): string {
    return frequencia ? `${frequencia} bpm` : '-';
  }

  formatarSaturacao(saturacao?: number): string {
    return saturacao ? `${saturacao}%` : '-';
  }

  formatarData(data: Date): string {
    return new Date(data).toLocaleString('pt-BR');
  }

  visualizar(id: number): void {
    this.router.navigate(['/sinais-vitais', id]);
  }

  editar(id: number): void {
    this.router.navigate(['/sinais-vitais', id, 'edit']);
  }

  excluir(sinalVital: SinalVital): void {
    if (
      confirm(
        `Deseja realmente excluir o registro de sinais vitais de ${this.formatarData(
          sinalVital.dataMedicao
        )}?`
      )
    ) {
      this.sinaisVitaisService.excluir(sinalVital.id).subscribe({
        next: () => {
          this.snackBar.open('Registro excluido com sucesso', 'Fechar', {
            duration: 3000,
          });
          this.carregarSinaisVitais();
        },
        error: (error) => {
          console.error('Erro ao excluir sinais vitais:', error);
          this.snackBar.open('Erro ao excluir registro', 'Fechar', {
            duration: 3000,
          });
        },
      });
    }
  }

  verEstatisticas(residenteId: number): void {
    this.router.navigate([
      '/sinais-vitais/residente',
      residenteId,
      'estatisticas',
    ]);
  }

  novoRegistro(): void {
    this.router.navigate(['/sinais-vitais/novo']);
  }
}

// Componente de listagem de sinais vitais
// Exibe tabela com filtros, paginacao e acoes
// Permite visualizar, editar e excluir registros
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
