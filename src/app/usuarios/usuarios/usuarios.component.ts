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
import { Router } from '@angular/router';
import { Usuario } from '../usuario';
import { UsuariosService } from '../usuarios.service';
import { AddUsuarioDialogComponent } from '../add-usuario-dialog/add-usuario-dialog.component';
import { EditUsuarioDialogComponent } from '../edit-usuario-dialog/edit-usuario-dialog.component';

@Component({
  selector: 'app-usuarios',
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
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  dataSource = new MatTableDataSource<Usuario>(this.usuarios);
  isAdmin = false;
  private isBrowser: boolean;

  displayedColumns: string[] = [
    'username',
    'nome',
    'email',
    'cargo',
    'ativo',
    'createdAt',
    'acoes',
  ];

  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private usuariosService: UsuariosService,
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
    this.loadUsuarios();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadUsuarios(): void {
    this.usuariosService.listarUsuarios(1, 100).subscribe({
      next: (response) => {
        this.usuarios = response.data;
        this.dataSource.data = this.usuarios;
      },
      error: (error) => {
        console.error('Erro ao carregar usuarios:', error);
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addUsuario(): void {
    const dialogRef = this.dialog.open(AddUsuarioDialogComponent, {
      width: '600px',
      panelClass: 'responsive-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.usuariosService.createUsuario(result).subscribe({
          next: () => this.loadUsuarios(),
          error: (error) => console.error('Erro ao criar usuario:', error),
        });
      }
    });
  }

  editUsuario(usuario: Usuario): void {
    const dialogRef = this.dialog.open(EditUsuarioDialogComponent, {
      width: '600px',
      data: usuario,
      panelClass: 'responsive-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.usuariosService.updateUsuario(usuario.id, result).subscribe({
          next: () => this.loadUsuarios(),
          error: (error) => console.error('Erro ao atualizar usuario:', error),
        });
      }
    });
  }

  deleteUsuario(id: number, username: string): void {
    if (confirm(`Tem certeza que deseja excluir o usuario ${username}?`)) {
      this.usuariosService.deleteUsuario(id).subscribe({
        next: () => this.loadUsuarios(),
        error: (error) => console.error('Erro ao excluir usuario:', error),
      });
    }
  }

  getCargoClass(cargo: string): string {
    return cargo === 'admin' ? 'cargo-admin' : 'cargo-funcionario';
  }

  getStatusClass(ativo: boolean): string {
    return ativo ? 'status-ativo' : 'status-inativo';
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  }
}

// Componente de listagem e gestao de usuarios
// Acesso restrito apenas para administradores
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
