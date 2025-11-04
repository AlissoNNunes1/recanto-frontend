import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DashboardService } from '../services/dashboard/dashboard.service';
import { DashboardStats, CardStats, AtividadeRecente } from '../services/dashboard/dashboard';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  role: string = '';
  nome: string = '';
  private isBrowser: boolean;
  loading = false;
  
  // Dashboard data
  dashboardStats: DashboardStats | null = null;
  cards: CardStats[] = [];
  atividadesRecentes: AtividadeRecente[] = [];

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private dashboardService: DashboardService,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.role = localStorage.getItem('role') || 'funcionario';
      this.nome = localStorage.getItem('nome') || 'Usuario';
      this.nome = this.nome.split(' ')[0];
      
      // Carregar dashboard apenas para admin
      if (this.role === 'admin') {
        this.loadDashboard();
      }
    } else {
      this.role = 'funcionario';
    }
  }

  loadDashboard(): void {
    this.loading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.buildCards(stats);
        this.atividadesRecentes = stats.auditoria.ultimasAtividades;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dashboard:', error);
        this.loading = false;
      },
    });
  }

  buildCards(stats: DashboardStats): void {
    this.cards = [
      {
        title: 'Total de Residentes',
        value: stats.totalResidentes,
        icon: 'people',
        color: '#2196f3',
        subtitle: `${stats.residentes.ativos} ativos`,
        trend: {
          value: stats.residentes.recentes,
          isPositive: true,
        },
      },
      {
        title: 'Total de Funcionarios',
        value: stats.totalFuncionarios,
        icon: 'badge',
        color: '#4caf50',
        subtitle: `${stats.funcionarios.ativos} ativos`,
        trend: {
          value: stats.funcionarios.recentes,
          isPositive: true,
        },
      },
      {
        title: 'Total de Usuarios',
        value: stats.totalUsuarios,
        icon: 'account_circle',
        color: '#ff9800',
        subtitle: 'Sistema de acesso',
      },
      {
        title: 'IPs Autorizados',
        value: stats.totalIPsAutorizados,
        icon: 'router',
        color: '#9c27b0',
        subtitle: 'Acesso automatico',
      },
      {
        title: 'Logs de Auditoria',
        value: stats.auditoria.totalLogs,
        icon: 'history',
        color: '#f44336',
        subtitle: 'Registros totais',
      },
    ];
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getCardRoute(title: string): string {
    const routes: { [key: string]: string } = {
      'Total de Residentes': '/residents',
      'Total de Funcionarios': '/funcionarios',
      'Total de Usuarios': '/usuarios',
      'IPs Autorizados': '/ips-autorizados',
      'Logs de Auditoria': '/auditoria',
    };
    return routes[title] || '/home';
  }

  getAcaoClass(acao: string): string {
    const classes: { [key: string]: string } = {
      CREATE_RESIDENTE: 'acao-create',
      CREATE_FUNCIONARIO: 'acao-create',
      CREATE_USUARIO: 'acao-create',
      VIEW_RESIDENTE: 'acao-read',
      VIEW_FUNCIONARIO: 'acao-read',
      UPDATE_RESIDENTE: 'acao-update',
      UPDATE_FUNCIONARIO: 'acao-update',
      UPDATE_USUARIO: 'acao-update',
      DELETE_RESIDENTE: 'acao-delete',
      DELETE_FUNCIONARIO: 'acao-delete',
      DELETE_USUARIO: 'acao-delete',
      LOGIN_SUCCESS: 'acao-login',
      LOGOUT: 'acao-logout',
      LOGIN_FAILED: 'acao-failed',
    };
    return classes[acao] || 'acao-read';
  }

  getAcaoIcon(acao: string): string {
    const icons: { [key: string]: string } = {
      CREATE_RESIDENTE: 'add_circle',
      CREATE_FUNCIONARIO: 'add_circle',
      CREATE_USUARIO: 'add_circle',
      VIEW_RESIDENTE: 'visibility',
      VIEW_FUNCIONARIO: 'visibility',
      UPDATE_RESIDENTE: 'edit',
      UPDATE_FUNCIONARIO: 'edit',
      UPDATE_USUARIO: 'edit',
      DELETE_RESIDENTE: 'delete',
      DELETE_FUNCIONARIO: 'delete',
      DELETE_USUARIO: 'delete',
      LOGIN_SUCCESS: 'login',
      LOGOUT: 'logout',
      LOGIN_FAILED: 'error',
    };
    return icons[acao] || 'info';
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleString('pt-BR');
  }

  getTimeAgo(date: Date): string {
    if (!date) return '';
    const now = new Date().getTime();
    const past = new Date(date).getTime();
    const diff = now - past;
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atras`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atras`;
    
    const days = Math.floor(hours / 24);
    return `${days}d atras`;
  }
}
