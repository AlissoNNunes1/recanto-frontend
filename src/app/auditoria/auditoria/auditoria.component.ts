import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { LogAuditoria, FiltrosAuditoria } from '../log-auditoria';
import { AuditoriaService } from '../auditoria.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
  ],
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.css'],
})
export class AuditoriaComponent implements OnInit {
  logs: LogAuditoria[] = [];
  dataSource = new MatTableDataSource<LogAuditoria>(this.logs);
  isAdmin = false;
  loading = false;
  private isBrowser: boolean;

  filtrosForm: FormGroup;
  acoes = [
    'LOGIN_SUCCESS',
    'LOGIN_FAILED',
    'LOGOUT',
    'CREATE_RESIDENTE',
    'UPDATE_RESIDENTE',
    'DELETE_RESIDENTE',
    'CREATE_FUNCIONARIO',
    'UPDATE_FUNCIONARIO',
    'DELETE_FUNCIONARIO',
    'CREATE_USUARIO',
    'UPDATE_USUARIO',
    'DELETE_USUARIO',
  ];

  displayedColumns: string[] = [
    'timestamp',
    'usuario',
    'acao',
    'recurso',
    'ip',
    'detalhes',
  ];

  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private auditoriaService: AuditoriaService,
    private fb: FormBuilder,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.filtrosForm = this.fb.group({
      acao: [''],
      recurso: [''],
      dataInicio: [''],
      dataFim: [''],
      ip: [''],
    });
  }

  ngOnInit(): void {
    this.dataSource.sort = this.sort;
    if (this.isBrowser) {
      this.isAdmin = localStorage.getItem('role') === 'admin';
      if (!this.isAdmin) {
        this.router.navigate(['/home']);
        return;
      }
    }
    this.loadLogs();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadLogs(): void {
    this.loading = true;
    const filtros: FiltrosAuditoria = {
      ...this.filtrosForm.value,
      page: 1,
      limit: 100,
    };

    // Converter datas para ISO string
    if (filtros.dataInicio) {
      filtros.dataInicio = new Date(filtros.dataInicio).toISOString();
    }
    if (filtros.dataFim) {
      filtros.dataFim = new Date(filtros.dataFim).toISOString();
    }

    // Remover campos vazios
    Object.keys(filtros).forEach((key) => {
      if (!filtros[key as keyof FiltrosAuditoria]) {
        delete filtros[key as keyof FiltrosAuditoria];
      }
    });

    this.auditoriaService.listarLogs(filtros).subscribe({
      next: (response) => {
        this.logs = response.data;
        this.dataSource.data = this.logs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar logs:', error);
        this.loading = false;
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  aplicarFiltros(): void {
    this.loadLogs();
  }

  limparFiltros(): void {
    this.filtrosForm.reset();
    this.loadLogs();
  }

  exportarLogs(): void {
    const filtros: FiltrosAuditoria = {
      ...this.filtrosForm.value,
    };

    if (filtros.dataInicio) {
      filtros.dataInicio = new Date(filtros.dataInicio).toISOString();
    }
    if (filtros.dataFim) {
      filtros.dataFim = new Date(filtros.dataFim).toISOString();
    }

    Object.keys(filtros).forEach((key) => {
      if (!filtros[key as keyof FiltrosAuditoria]) {
        delete filtros[key as keyof FiltrosAuditoria];
      }
    });

    this.auditoriaService.exportarLogs(filtros).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erro ao exportar logs:', error);
      },
    });
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

  truncateText(text: string, length: number = 50): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
}

// Componente de visualizacao de logs de auditoria
// Acesso restrito apenas para administradores
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
