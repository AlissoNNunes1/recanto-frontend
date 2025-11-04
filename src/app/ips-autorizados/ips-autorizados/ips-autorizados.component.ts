import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { IPAutorizado } from '../ip-autorizado';
import { IpsAutorizadosService } from '../ips-autorizados.service';
import { AddIpDialogComponent } from '../add-ip-dialog/add-ip-dialog.component';
import { EditIpDialogComponent } from '../edit-ip-dialog/edit-ip-dialog.component';

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
export class IpsAutorizadosComponent implements OnInit {
  ips: IPAutorizado[] = [];
  dataSource = new MatTableDataSource<IPAutorizado>(this.ips);
  isAdmin = false;
  private isBrowser: boolean;

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
    public dialog: MatDialog,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
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
    this.loadIPs();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadIPs(): void {
    this.ipsService.listarIPs(1, 100).subscribe({
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.ipsService.createIP(result).subscribe({
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.ipsService.updateIP(ip.id, result).subscribe({
          next: () => this.loadIPs(),
          error: (error) => console.error('Erro ao atualizar IP:', error),
        });
      }
    });
  }

  deleteIP(id: number, ip: string): void {
    if (confirm(`Tem certeza que deseja excluir o IP ${ip}?`)) {
      this.ipsService.deleteIP(id).subscribe({
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
