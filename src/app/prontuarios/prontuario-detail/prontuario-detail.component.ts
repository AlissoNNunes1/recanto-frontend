import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { AnexosPreviewComponent } from '../../anexos-preview/anexos-preview.component';
import { Anexo, AnexosService } from '../../services/anexos.service';
import { ProntuarioReportService } from '../../services/reports';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import {
  Consulta,
  Exame,
  MedicamentoPrescrito,
  ProntuarioEletronico,
} from '../prontuario';
import { ProntuariosService } from '../prontuarios.service';

@Component({
  selector: 'app-prontuario-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    MatChipsModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    AnexosPreviewComponent,
  ],
  templateUrl: './prontuario-detail.component.html',
  styleUrls: ['./prontuario-detail.component.css'],
})
export class ProntuarioDetailComponent implements OnInit {
  prontuario: ProntuarioEletronico | null = null;
  consultas: Consulta[] = [];
  exames: Exame[] = [];
  medicamentos: MedicamentoPrescrito[] = [];
  anexos: Anexo[] = [];

  loading = true;
  error: string | null = null;
  isAdmin = false;
  private isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private prontuariosService: ProntuariosService,
    private reportService: ProntuarioReportService,
    private anexosService: AnexosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.isAdmin = localStorage.getItem('role') === 'admin';
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProntuario(Number(id));
    }
  }

  loadProntuario(id: number): void {
    this.loading = true;
    this.error = null;

    this.prontuariosService.getProntuario(id).subscribe({
      next: (prontuario) => {
        this.prontuario = prontuario;
        this.loadConsultas(id);
        this.loadExames(id);
        this.loadMedicamentos(id);
        this.loadAnexos(id);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar prontuario:', error);
        this.error = 'Erro ao carregar prontuario. Tente novamente.';
        this.loading = false;
      },
    });
  }

  loadConsultas(prontuarioId: number): void {
    this.prontuariosService.getConsultas(prontuarioId).subscribe({
      next: (consultas) => {
        this.consultas = consultas;
      },
      error: (error) => {
        console.error('Erro ao carregar consultas:', error);
      },
    });
  }

  loadExames(prontuarioId: number): void {
    this.prontuariosService.getExames(prontuarioId).subscribe({
      next: (exames) => {
        this.exames = exames;
      },
      error: (error) => {
        console.error('Erro ao carregar exames:', error);
      },
    });
  }

  loadMedicamentos(prontuarioId: number): void {
    this.prontuariosService.getMedicamentos(prontuarioId).subscribe({
      next: (medicamentos) => {
        this.medicamentos = medicamentos;
      },
      error: (error) => {
        console.error('Erro ao carregar medicamentos:', error);
      },
    });
  }

  loadAnexos(prontuarioId: number): void {
    // Carregar anexos de todas as consultas e exames do prontuario
    this.anexos = [];

    // Carregar anexos das consultas
    this.prontuariosService.getConsultas(prontuarioId).subscribe({
      next: (consultas) => {
        consultas.forEach((consulta) => {
          if (consulta.id) {
            this.anexosService.listarPorConsulta(consulta.id).subscribe({
              next: (anexos: Anexo[]) => {
                this.anexos = [...this.anexos, ...anexos];
              },
              error: (error: any) => {
                console.error('Erro ao carregar anexos da consulta:', error);
              },
            });
          }
        });
      },
    });

    // Carregar anexos dos exames
    this.prontuariosService.getExames(prontuarioId).subscribe({
      next: (exames) => {
        exames.forEach((exame) => {
          if (exame.id) {
            this.anexosService.listarPorExame(exame.id).subscribe({
              next: (anexos: Anexo[]) => {
                this.anexos = [...this.anexos, ...anexos];
              },
              error: (error: any) => {
                console.error('Erro ao carregar anexos do exame:', error);
              },
            });
          }
        });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/prontuarios']);
  }

  editProntuario(): void {
    if (this.prontuario) {
      this.router.navigate(['/prontuario/edit', this.prontuario.id]);
    }
  }

  addConsulta(): void {
    if (this.prontuario) {
      this.router.navigate([
        '/prontuario',
        this.prontuario.id,
        'consulta',
        'add',
      ]);
    }
  }

  addExame(): void {
    if (this.prontuario) {
      this.router.navigate(['/prontuario', this.prontuario.id, 'exame', 'add']);
    }
  }

  addMedicamento(): void {
    if (this.prontuario) {
      this.router.navigate([
        '/prontuario',
        this.prontuario.id,
        'medicamento',
        'add',
      ]);
    }
  }

  editConsulta(consultaId: number): void {
    if (this.prontuario) {
      this.router.navigate([
        '/prontuario',
        this.prontuario.id,
        'consulta',
        consultaId,
        'edit',
      ]);
    }
  }

  editExame(exameId: number): void {
    if (this.prontuario) {
      this.router.navigate([
        '/prontuario',
        this.prontuario.id,
        'exame',
        exameId,
        'edit',
      ]);
    }
  }

  editMedicamento(medicamentoId: number): void {
    if (this.prontuario) {
      this.router.navigate([
        '/prontuario',
        this.prontuario.id,
        'medicamento',
        medicamentoId,
        'edit',
      ]);
    }
  }

  suspenderMedicamento(medicamentoId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Suspender Medicamento',
        message:
          'Deseja realmente suspender esta prescricao? O medicamento nao sera mais administrado ao residente.',
        confirmText: 'Sim, Suspender',
        cancelText: 'Cancelar',
        type: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && this.prontuario) {
        this.prontuariosService.suspenderMedicamento(medicamentoId).subscribe({
          next: () => {
            this.showSuccess('Medicamento suspenso com sucesso');
            this.loadMedicamentos(this.prontuario!.id);
          },
          error: (error) => {
            console.error('Erro ao suspender medicamento:', error);
            this.showError('Erro ao suspender medicamento');
          },
        });
      }
    });
  }

  excluirMedicamento(medicamentoId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Excluir Medicamento',
        message:
          'ATENCAO: Esta acao NAO pode ser desfeita! Deseja realmente excluir permanentemente esta prescricao do prontuario?',
        confirmText: 'Sim, Excluir Permanentemente',
        cancelText: 'Cancelar',
        type: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && this.prontuario) {
        this.prontuariosService.excluirMedicamento(medicamentoId).subscribe({
          next: () => {
            this.showSuccess('Medicamento excluido com sucesso');
            this.loadMedicamentos(this.prontuario!.id);
          },
          error: (err: unknown) => {
            console.error('Erro ao excluir medicamento:', err);
            this.showError('Erro ao excluir medicamento');
          },
        });
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getStatusChipColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status.toUpperCase()) {
      case 'ATIVO':
      case 'REALIZADA':
      case 'CONCLUIDO':
        return 'primary';
      case 'AGENDADA':
      case 'SOLICITADO':
      case 'EM_ANDAMENTO':
        return 'accent';
      case 'CANCELADA':
      case 'SUSPENSO':
      case 'INATIVO':
        return 'warn';
      default:
        return 'primary';
    }
  }

  generateReport(): void {
    if (this.prontuario) {
      this.reportService.generateProntuarioReport(
        this.prontuario,
        this.consultas,
        this.exames,
        this.medicamentos,
        this.anexos
      );
    }
  }
}

// Componente de detalhes do prontuario eletronico
// Exibe informacoes completas do prontuario, consultas, exames e medicamentos
// Permite navegacao para edicao e adicao de novos registros
// Geracao de relatorios PDF com todas as informacoes do prontuario
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
