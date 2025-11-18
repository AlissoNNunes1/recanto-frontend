import { LiveAnnouncer } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { ContentService } from '../../services/content.service';
import { AtribuirusuarioComponent } from '../atribuirusuario/atribuirusuario.component';
import { Funcionario } from '../funcionario';
import { FuncionariosService } from '../funcionarios.service';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatSortModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './funcionarios.component.html',
  styleUrls: ['./funcionarios.component.css'],
})
export class FuncionariosComponent implements OnInit, OnDestroy {
  funcionarios: Funcionario[] = [];
  dataSource = new MatTableDataSource<Funcionario>(this.funcionarios);
  selection = new SelectionModel<Funcionario>(true, []);

  private isBrowser: boolean;
  private unsubscribe$ = new Subject<void>();

  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  // Usar AuthService ao invez de localStorage
  isAdmin: boolean = false;

  constructor(
    private funcionariosService: FuncionariosService,
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    private contentService: ContentService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.dataSource.sort = this.sort;
    this.getFuncionarios();
    if (this.isBrowser) {
      // Usar AuthService ao invez de localStorage
      this.isAdmin = this.authService.isAdminRole();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(
        `Sorted by ${sortState.active} ${sortState.direction}`
      );
    } else {
      this._liveAnnouncer.announce('Sorting removed');
    }
  }

  atribuirUsuario(funcionario: Funcionario): void {
    const partes = funcionario.nome.split(' ');
    const sobrenome =
      partes.length > 1 ? partes[1].toLowerCase() : partes[0].toLowerCase();
    const senhaGerada = `${sobrenome}${funcionario.cpf.substring(
      0,
      3
    )}@${funcionario.cpf.substring(3, 6)}`;
    const novoUsuario = {
      nome: funcionario.nome,
      username: `${partes[0].toLowerCase()}.${sobrenome}`,
      email: funcionario.email,
      senha: senhaGerada,
      cargo: 'funcionario',
    };

    this.funcionariosService
      .atribuirUsuario(funcionario.id, novoUsuario)
      .pipe(takeUntil(this.unsubscribe$)) // Cleanup automatico
      .subscribe({
        next: (response) => {
          // response provavelmente ja eh o usuario criado/retornado
          funcionario.usuarioId =
            (response as any).id ?? (response as any).usuario?.id;
          this.dialog.open(AtribuirusuarioComponent, {
            data: {
              nome: funcionario.nome,
              email: funcionario.email,
              senha: senhaGerada,
              role: funcionario.funcao,
              username: novoUsuario.username,
            },
          });
        },
        error: (error) => console.error('Erro ao atribuir usuário', error),
      });
  }

  verCredenciais(funcionario: Funcionario): void {
    this.funcionariosService
      .getUsuarioByFuncionarioId(funcionario.id)
      .pipe(takeUntil(this.unsubscribe$)) // Cleanup automatico
      .subscribe({
        next: (usuario) => {
          this.dialog.open(AtribuirusuarioComponent, {
            data: {
              nome: funcionario.nome,
              email: funcionario.email,
              senha: usuario.senha,
              role: funcionario.funcao,
              username: usuario.username,
            },
          });
        },
        error: (error) => console.error('Erro ao buscar usuário', error),
      });
  }

  getFuncionarios(): void {
    const cacheKey = 'funcionarios';
    if (this.contentService.has(cacheKey)) {
      this.contentService
        .get<Funcionario[]>(cacheKey)
        .pipe(takeUntil(this.unsubscribe$)) // Cleanup automatico
        .subscribe({
          next: (cachedFuncionarios) => {
            if (cachedFuncionarios) {
              this.funcionarios = cachedFuncionarios;
              this.dataSource.data = this.funcionarios;
            }
          },
        });
    } else {
      this.funcionariosService
        .getFuncionarios()
        .pipe(takeUntil(this.unsubscribe$)) // Cleanup automatico
        .subscribe((funcionarios) => {
          this.funcionarios = funcionarios;
          this.dataSource.data = this.funcionarios;
          this.contentService.set(cacheKey, funcionarios);
        });
    }
  }

  deleteFuncionario(id: number): void {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      this.funcionariosService
        .deleteFuncionario(id)
        .pipe(takeUntil(this.unsubscribe$)) // Cleanup automatico
        .subscribe({
          next: () => this.getFuncionarios(),
          error: (error) =>
            console.error('Erro ao excluir funcionário:', error),
        });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addFuncionario(): void {
    this.router.navigate(['/funcionarios/add']);
  }

  viewFuncionario(id: number): void {
    this.router.navigate(['/funcionarios/detail', id]);
  }

  updateFuncionario(funcionario: Funcionario): void {
    this.router.navigate(['/funcionarios/edit', funcionario.id]);
  }

  temUsuario(funcionario: Funcionario): boolean {
    return !!funcionario.usuarioId && funcionario.usuarioId > 0;
  }

  displayedColumns: string[] = [
    'nome',
    'cpf',
    'funcao',
    'turno',
    'telefone',
    'email',
    'acoes',
  ];
}
