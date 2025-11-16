import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Evolucao, EvolucoesService } from '../services/evolucoes.service';

@Component({
  selector: 'app-evolucoes-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule,
  ],
  templateUrl: './evolucoes-detail.component.html',
  styleUrl: './evolucoes-detail.component.css',
})
export class EvolucoesDetailComponent implements OnInit {
  evolucao?: Evolucao;
  loading = false;

  constructor(
    private evolucoesService: EvolucoesService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.carregarEvolucao(parseInt(id));
      }
    });
  }

  carregarEvolucao(id: number): void {
    this.loading = true;
    this.evolucoesService.buscarPorId(id).subscribe({
      next: (evolucao) => {
        this.evolucao = evolucao;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar evolucao:', error);
        this.snackBar.open('Erro ao carregar evolucao', 'Fechar', {
          duration: 3000,
        });
        this.router.navigate(['/evolucoes']);
        this.loading = false;
      },
    });
  }

  editar(): void {
    if (this.evolucao) {
      this.router.navigate(['/evolucoes', this.evolucao.id, 'edit']);
    }
  }

  excluir(): void {
    if (this.evolucao && confirm('Deseja realmente excluir esta evolucao?')) {
      this.evolucoesService.excluir(this.evolucao.id).subscribe({
        next: () => {
          this.snackBar.open('Evolucao excluida com sucesso', 'Fechar', {
            duration: 3000,
          });
          this.router.navigate(['/evolucoes']);
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

  voltar(): void {
    this.router.navigate(['/evolucoes']);
  }

  formatarData(data: Date | undefined): string {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR');
  }
}

// Componente de detalhes de evolucao
// Exibe informacoes completas de uma evolucao especifica
// Permite editar e excluir
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
