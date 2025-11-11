import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  SinaisVitaisEstatisticas,
  SinaisVitaisService,
} from '../services/sinais-vitais.service';

@Component({
  selector: 'app-sinais-vitais-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule,
    BaseChartDirective,
  ],
  templateUrl: './sinais-vitais-stats.component.html',
  styleUrl: './sinais-vitais-stats.component.css',
})
export class SinaisVitaisStatsComponent implements OnInit {
  residenteId!: number;
  estatisticas?: SinaisVitaisEstatisticas;
  loading = false;
  periodoSelecionado = 30;
  periodosDisponiveis = [7, 15, 30, 60, 90];

  // Configuracao dos graficos
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  // Dados para grafico de pressao arterial
  pressaoChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Pressao Sistolica',
        data: [],
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Pressao Diastolica',
        data: [],
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Dados para grafico de temperatura
  temperaturaChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Temperatura (C)',
        data: [],
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Dados para grafico de frequencia cardiaca
  frequenciaChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Frequencia Cardiaca (bpm)',
        data: [],
        borderColor: '#e91e63',
        backgroundColor: 'rgba(233, 30, 99, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Dados para grafico de saturacao
  saturacaoChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Saturacao O2 (%)',
        data: [],
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
      },
    ],
  };

  constructor(
    private sinaisVitaisService: SinaisVitaisService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('residenteId');
    if (id) {
      this.residenteId = parseInt(id, 10);
      this.carregarEstatisticas();
    }
  }

  carregarEstatisticas(): void {
    this.loading = true;
    this.sinaisVitaisService
      .calcularEstatisticas(this.residenteId, this.periodoSelecionado)
      .subscribe({
        next: (stats) => {
          this.estatisticas = stats;
          this.atualizarGraficos();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar estatisticas:', error);
          this.snackBar.open('Erro ao carregar estatisticas', 'Fechar', {
            duration: 3000,
          });
          this.loading = false;
        },
      });
  }

  atualizarGraficos(): void {
    if (!this.estatisticas) return;

    const historico = this.estatisticas.historico;
    const labels = historico.map((sv) =>
      new Date(sv.dataMedicao).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
    );

    // Atualizar grafico de pressao
    this.pressaoChartData.labels = labels;
    this.pressaoChartData.datasets[0].data = historico.map(
      (sv) => sv.pressaoSistolica || null
    );
    this.pressaoChartData.datasets[1].data = historico.map(
      (sv) => sv.pressaoDiastolica || null
    );

    // Atualizar grafico de temperatura
    this.temperaturaChartData.labels = labels;
    this.temperaturaChartData.datasets[0].data = historico.map(
      (sv) => sv.temperatura || null
    );

    // Atualizar grafico de frequencia cardiaca
    this.frequenciaChartData.labels = labels;
    this.frequenciaChartData.datasets[0].data = historico.map(
      (sv) => sv.frequenciaCardiaca || null
    );

    // Atualizar grafico de saturacao
    this.saturacaoChartData.labels = labels;
    this.saturacaoChartData.datasets[0].data = historico.map(
      (sv) => sv.saturacaoOxigenio || null
    );
  }

  mudarPeriodo(dias: number): void {
    this.periodoSelecionado = dias;
    this.carregarEstatisticas();
  }

  voltar(): void {
    this.router.navigate(['/sinais-vitais'], {
      queryParams: { residenteId: this.residenteId },
    });
  }

  novoRegistro(): void {
    this.router.navigate(['/sinais-vitais/novo'], {
      queryParams: { residenteId: this.residenteId },
    });
  }

  formatarValor(valor?: number): string {
    return valor !== undefined && valor !== null ? valor.toFixed(1) : 'N/A';
  }
}

// Componente de estatisticas de sinais vitais
// Exibe graficos de tendencias e medias calculadas
// Permite selecionar periodo de analise
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
