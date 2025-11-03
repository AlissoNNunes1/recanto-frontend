import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { AtribuirusuarioComponent } from '../atribuirusuario/atribuirusuario.component';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';


@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [DatePipe, CommonModule, MatDialogModule, MatSortModule, MatTableModule  ],
  templateUrl: './funcionarios.component.html',
  styleUrls: ['./funcionarios.component.css'],
})
export class FuncionariosComponent implements OnInit {
  funcionarios: Funcionario[] = [];
  dataSource = new MatTableDataSource<Funcionario>(this.funcionarios);
  selection = new SelectionModel<Funcionario>(true, []);
  isAdmin: boolean = false;

  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  constructor(
    private funcionariosService: FuncionariosService,
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    private contentService: ContentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dataSource.sort = this.sort;
    this.getFuncionarios();
    this.isAdmin = localStorage.getItem('role') === 'admin';
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(
        `Sorted by ${sortState.active} ${sortState.direction}`
      );
    } else {
      this._liveAnnouncer.announce(`Sorting removed`);
    }
  }

  atribuirUsuario(funcionario: Funcionario): void {
    const senhaGerada = funcionario.nome.split(' ')[1].toLowerCase() + funcionario.cpf.substring(0, 3)+'@'+funcionario.cpf.substring(3, 6);
    const novoUsuario = {
      nome: funcionario.nome,
      username: funcionario.nome.split(' ')[0].toLowerCase() + '.' + funcionario.nome.split(' ')[1].toLowerCase(),
      email: funcionario.email,
      senha: senhaGerada,
      cargo: 'funcionario'  // Ou o cargo adequado
    };
    this.funcionariosService.atribuirUsuario(funcionario.id, novoUsuario).subscribe(response => {
      funcionario.UsuarioId = response.usuario.id;
      this.dialog.open(AtribuirusuarioComponent, {
        data: { nome: funcionario.nome, email: funcionario.email, senha: senhaGerada, role: funcionario.funcao, username: novoUsuario.username }
      });
    },error => {
      console.error('Erro ao atribuir usuário', error);
    });
    }
    verCredenciais(funcionario: Funcionario): void {
      this.funcionariosService.getUsuarioByFuncionarioId(funcionario.id).subscribe(response => {
          const usuario = response;
          this.dialog.open(AtribuirusuarioComponent, {
            data: { nome: funcionario.nome, email: funcionario.email, senha: usuario.senha, role: funcionario.funcao, username: usuario.username }
          });
      }, error => {
          console.error('Erro ao buscar usuário', error);
      });
  }

  getFuncionarios(): void {
    const cacheKey = 'funcionarios';
    if (this.contentService.has(cacheKey)) {
      this.contentService
        .get<Funcionario[]>(cacheKey)
        .subscribe((cachedFuncionarios) => {
          if (cachedFuncionarios) {
            this.funcionarios = cachedFuncionarios;
            this.dataSource.data = this.funcionarios;
          }
        });
    } else {
      this.funcionariosService.getFuncionarios().subscribe(funcionarios => {
        this.funcionarios = funcionarios;
        this.dataSource.data = this.funcionarios;
        this.contentService.set(cacheKey, funcionarios); // Armazena os dados no cache
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

  deleteFuncionario(id: number): void {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      this.funcionariosService.deleteFuncionario(id).subscribe({
        next: () => {
          console.log('Funcionário excluído com sucesso');
          this.getFuncionarios(); // Recarregar lista
        },
        error: (error) => {
          console.error('Erro ao excluir funcionário:', error);
        },
      });
    }
  }

  // Método auxiliar para verificar se funcionário tem usuário
  temUsuario(funcionario: Funcionario): boolean {
    return !!funcionario.usuarioId && funcionario.usuarioId > 0; // Corrigido: usuarioId
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

// Componente atualizado para adequação ao backend
// Corrigidas propriedades e métodos para compatibilidade
// Implementadas funções de CRUD e gestão de usuários
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
