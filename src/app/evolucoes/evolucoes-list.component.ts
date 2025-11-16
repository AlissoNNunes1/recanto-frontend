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
  Evolucao,
  EvolucoesFiltros,
  EvolucoesService,
} from '../services/evolucoes.service';

@Component({
  selector: 'app-evolucoes-list',
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
  templateUrl: './evolucoes-list.component.html',
  styleUrl: './evolucoes-list.component.css',
})
export class EvolucoesListComponent implements OnInit {
  displayedColumns: string[] = [
    'dataRegistro',
    'residente',
    'descricao',
    'dataSeguimento',
    'acoes',
  ];

  evolucoes: Evolucao[] = [];
  residentes: any[] = [];
  loading = false;
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  filtros: EvolucoesFiltros = {
    page: 1,
    limit: 10,
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private evolucoesService: EvolucoesService,
    private residentsService: ResidentsService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarResidentes();
    this.carregarEvolucoes();
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

  carregarEvolucoes(): void {
    this.loading = true;
    this.evolucoesService.listar(this.filtros).subscribe({
      next: (response) => {
        this.evolucoes = response.data;
        this.totalItems = response.pageInfo.totalItems;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar evolucoes:', error);
        this.snackBar.open('Erro ao carregar evolucoes', 'Fechar', {
          duration: 3000,
        });
        this.loading = false;
      },
    });
  }

  aplicarFiltros(): void {
    this.filtros.page = 1;
    this.pageIndex = 0;
    this.carregarEvolucoes();
  }

  limparFiltros(): void {
    this.filtros = {
      page: 1,
      limit: 10,
    };
    this.pageIndex = 0;
    this.carregarEvolucoes();
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.filtros.page = event.pageIndex + 1;
    this.filtros.limit = event.pageSize;
    this.carregarEvolucoes();
  }

  getNomeResidente(evolucao: Evolucao): string {
    return evolucao.residente?.nome || 'N/A';
  }

  getTruncadoDescricao(descricao: string, length: number = 50): string {
    if (!descricao) return '-';
    return descricao.length > length
      ? descricao.substring(0, length) + '...'
      : descricao;
  }

  formatarData(data: Date | undefined): string {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR');
  }

  visualizar(id: number): void {
    this.router.navigate(['/evolucoes', id]);
  }

  editar(id: number): void {
    this.router.navigate(['/evolucoes', id, 'edit']);
  }

  excluir(evolucao: Evolucao): void {
    if (
      confirm(
        `Deseja realmente excluir a evolucao de ${this.formatarData(
          evolucao.dataRegistro
        )}?`
      )
    ) {
      this.evolucoesService.excluir(evolucao.id).subscribe({
        next: () => {
          this.snackBar.open('Evolucao excluida com sucesso', 'Fechar', {
            duration: 3000,
          });
          this.carregarEvolucoes();
        },
        error: (error) => {
          console.error('Erro ao excluir evolucao:', error);
          this.snackBar.open('Erro ao excluir evolucao', 'Fechar', {
            duration: 3000,
          });
        },
      });
    }
  }

  verUltimas(residenteId: number): void {
    this.router.navigate(['/evolucoes/residente', residenteId, 'ultimas']);
  }

  novoRegistro(): void {
    this.router.navigate(['/evolucoes/novo']);
  }
}

// Componente de listagem de evolucoes
// Exibe tabela com filtros, paginacao e acoes
// Permite visualizar, editar e excluir registros
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
