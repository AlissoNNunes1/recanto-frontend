import { LiveAnnouncer } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { AtribuirusuarioComponent } from '../atribuirusuario/atribuirusuario.component';
import { CreateUsuarioForFuncionarioDto, Funcionario } from '../funcionario';
import { FuncionariosService } from '../funcionarios.service';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [
    DatePipe,
    CommonModule,
    MatDialogModule,
    MatSortModule,
    MatTableModule,
  ],
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
    // Gerar dados do usuário usando os métodos da entidade
    const nomes = funcionario.nome.split(' ');
    const primeiroNome = nomes[0].toLowerCase();
    const segundoNome =
      nomes.length > 1 ? nomes[1].toLowerCase() : nomes[0].toLowerCase();
    const ultimoNome = nomes[nomes.length - 1].toLowerCase();

    // Gerar username: primeiro.ultimo
    const username = `${primeiroNome}.${ultimoNome}`.replace(/[^a-z.]/g, '');

    // Gerar senha: segundo_nome.primeiros_3_cpf@digitos_4_a_6_cpf
    const cpfLimpo = funcionario.cpf.replace(/\D/g, '');
    const senhaGerada = `${segundoNome}.${cpfLimpo.substring(
      0,
      3
    )}@${cpfLimpo.substring(3, 6)}`;

    const dadosUsuario: CreateUsuarioForFuncionarioDto = {
      nome: funcionario.nome,
      username: username,
      email: funcionario.email,
      senha: senhaGerada,
      cargo: 'funcionario', // Definir cargo adequado baseado na função
    };

    this.funcionariosService
      .atribuirUsuario(funcionario.id, dadosUsuario)
      .subscribe({
        next: (usuarioCriado) => {
          // Atualizar o funcionário local
          funcionario.usuarioId = usuarioCriado.id; // Corrigido: usuarioId

          // Exibir credenciais no modal
          this.dialog.open(AtribuirusuarioComponent, {
            data: {
              nome: funcionario.nome,
              email: funcionario.email,
              senha: senhaGerada,
              role: funcionario.funcao,
              username: username,
            },
          });

          console.log('Usuário atribuído com sucesso:', usuarioCriado);
        },
        error: (error) => {
          console.error('Erro ao atribuir usuário:', error);
          // Aqui você pode adicionar uma notificação de erro para o usuário
        },
      });
  }

  verCredenciais(funcionario: Funcionario): void {
    this.funcionariosService
      .getUsuarioByFuncionarioId(funcionario.id)
      .subscribe({
        next: (usuario) => {
          this.dialog.open(AtribuirusuarioComponent, {
            data: {
              nome: funcionario.nome,
              email: funcionario.email,
              senha: usuario.senha || 'Senha não disponível',
              role: funcionario.funcao,
              username: usuario.username,
            },
          });
        },
        error: (error) => {
          console.error('Erro ao buscar usuário:', error);
          // Aqui você pode adicionar uma notificação de erro para o usuário
        },
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
      this.funcionariosService.getFuncionarios().subscribe({
        next: (funcionarios) => {
          this.funcionarios = funcionarios;
          this.dataSource.data = this.funcionarios;
          this.contentService.set(cacheKey, funcionarios);
        },
        error: (error) => {
          console.error('Erro ao carregar funcionários:', error);
        },
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
