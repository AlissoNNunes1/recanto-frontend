import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Medicamento } from '../medicamento';
import { MedicamentosService } from '../medicamentos.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-medicamentos',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './medicamentos.component.html',
  styleUrls: ['./medicamentos.component.css'],
})
export class MedicamentosComponent implements OnInit, OnDestroy {
  medicamentos: Medicamento[] = [];
  dataSource = new MatTableDataSource<Medicamento>(this.medicamentos);
  isAdmin = false;
  private isBrowser: boolean;
  private unsubscribe$ = new Subject<void>();

  displayedColumns: string[] = [
    'nome',
    'principioAtivo',
    'laboratorio',
    'concentracao',
    'formaFarmaceutica',
    'controlado',
    'ativo',
    'acoes',
  ];

  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private medicamentosService: MedicamentosService,
    private authService: AuthService,
    public dialog: MatDialog,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.dataSource.sort = this.sort;
    if (this.isBrowser) {
      this.isAdmin = this.authService.isAdminRole();
      if (!this.isAdmin) {
        this.router.navigate(['/home']);
        return;
      }
    }
    this.loadMedicamentos();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadMedicamentos(): void {
    this.medicamentosService.listarMedicamentos(1, 100).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (response) => {
        this.medicamentos = response.data;
        this.dataSource.data = this.medicamentos;
      },
      error: (error) => {
        console.error('Erro ao carregar medicamentos:', error);
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addMedicamento(): void {
    // Funcionalidade sera implementada com modal de criacao
    console.log('Adicionar medicamento');
  }

  editMedicamento(medicamento: Medicamento): void {
    // Funcionalidade sera implementada com modal de edicao
    console.log('Editar medicamento:', medicamento.id);
  }

  deleteMedicamento(id: number, nome: string): void {
    if (confirm(`Tem certeza que deseja excluir o medicamento ${nome}?`)) {
      this.medicamentosService.deleteMedicamento(id).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: () => this.loadMedicamentos(),
        error: (error) => console.error('Erro ao excluir medicamento:', error),
      });
    }
  }

  deactivateMedicamento(id: number): void {
    this.medicamentosService.deactivateMedicamento(id).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => this.loadMedicamentos(),
      error: (error) => console.error('Erro ao desativar medicamento:', error),
    });
  }

  reactivateMedicamento(id: number): void {
    this.medicamentosService.reactivateMedicamento(id).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => this.loadMedicamentos(),
      error: (error) => console.error('Erro ao reativar medicamento:', error),
    });
  }

  getControlledClass(controlado: boolean): string {
    return controlado ? 'status-controlado' : '';
  }

  getStatusClass(ativo: boolean): string {
    return ativo ? 'status-ativo' : 'status-inativo';
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  }
}

// Componente de listagem e gestao de medicamentos
// Acesso restrito apenas para administradores
// Cache 10 minutos para dados estaticos
/*
   __  ____ ____ _  _
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
