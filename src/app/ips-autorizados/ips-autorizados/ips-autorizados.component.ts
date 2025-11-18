import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
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
import { AuthService } from '../../auth/auth.service';
import { AddIpDialogComponent } from '../add-ip-dialog/add-ip-dialog.component';
import { EditIpDialogComponent } from '../edit-ip-dialog/edit-ip-dialog.component';
import { IPAutorizado } from '../ip-autorizado';
import { IpsAutorizadosService } from '../ips-autorizados.service';

@Component({
  selector: 'app-ips-autorizados',
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
  templateUrl: './ips-autorizados.component.html',
  styleUrls: ['./ips-autorizados.component.css'],
})
export class IpsAutorizadosComponent implements OnInit, OnDestroy {
  ips: IPAutorizado[] = [];
  dataSource = new MatTableDataSource<IPAutorizado>(this.ips);
  isAdmin = false;
  private isBrowser: boolean;
  private unsubscribe$ = new Subject<void>();

  displayedColumns: string[] = [
    'ip',
    'descricao',
    'ativo',
    'createdAt',
    'acoes',
  ];

  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private ipsService: IpsAutorizadosService,
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
    this.loadIPs();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadIPs(): void {
    this.ipsService
      .listarIPs(1, 100)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response) => {
          this.ips = response.data;
          this.dataSource.data = this.ips;
        },
        error: (error) => {
          console.error('Erro ao carregar IPs autorizados:', error);
        },
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addIP(): void {
    const dialogRef = this.dialog.open(AddIpDialogComponent, {
      width: '600px',
      panelClass: 'responsive-dialog',
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.ipsService
            .createIP(result)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
              next: () => this.loadIPs(),
              error: (error) => console.error('Erro ao criar IP:', error),
            });
        }
      });
  }

  editIP(ip: IPAutorizado): void {
    const dialogRef = this.dialog.open(EditIpDialogComponent, {
      width: '600px',
      data: ip,
      panelClass: 'responsive-dialog',
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.ipsService
            .updateIP(ip.id, result)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
              next: () => this.loadIPs(),
              error: (error) => console.error('Erro ao atualizar IP:', error),
            });
        }
      });
  }

  deleteIP(id: number, ip: string): void {
    if (confirm(`Tem certeza que deseja excluir o IP ${ip}?`)) {
      this.ipsService
        .deleteIP(id)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => this.loadIPs(),
          error: (error) => console.error('Erro ao excluir IP:', error),
        });
    }
  }

  getStatusClass(ativo: boolean): string {
    return ativo ? 'status-ativo' : 'status-inativo';
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  }
}

// Componente de listagem e gestao de IPs autorizados
// Acesso restrito apenas para administradores
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
