import { LiveAnnouncer } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from '../../services/content.service';
import {
  PaginacaoResponse,
  ProntuarioEletronico,
  StatusProntuario,
} from '../prontuario';
import { ProntuariosService } from '../prontuarios.service';

@Component({
  selector: 'app-prontuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    FormsModule,
  ],
  templateUrl: './prontuarios.component.html',
  styleUrls: ['./prontuarios.component.css'],
})
export class ProntuariosComponent implements OnInit, AfterViewInit {
  prontuarios: ProntuarioEletronico[] = [];
  dataSource = new MatTableDataSource<ProntuarioEletronico>(this.prontuarios);
  selection = new SelectionModel<ProntuarioEletronico>(true, []);
  isAdmin: boolean = false;

  // Filtros
  filtroNome: string = '';
  filtroStatus: StatusProntuario | '' = '';

  // Paginação
  totalItems: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;

  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  statusOptions = Object.values(StatusProntuario);

  constructor(
    private prontuariosService: ProntuariosService,
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    private contentService: ContentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = localStorage.getItem('role') === 'admin';
    this.loadProntuarios();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.paginator.page.subscribe(() => {
      this.currentPage = this.paginator.pageIndex + 1;
      this.loadProntuarios();
    });
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

  loadProntuarios(): void {
    const filtros: any = {
      page: this.currentPage,
      limit: this.pageSize,
    };

    if (this.filtroNome.trim()) {
      filtros.residenteNome = this.filtroNome.trim();
    }

    if (this.filtroStatus) {
      filtros.status = this.filtroStatus;
    }

    this.prontuariosService.getProntuarios(filtros).subscribe({
      next: (response: PaginacaoResponse<ProntuarioEletronico>) => {
        this.prontuarios = response.data;
        this.dataSource.data = this.prontuarios;
        this.totalItems = response.pageInfo.totalItems;
      },
      error: (error) => {
        console.error('Erro ao carregar prontuários:', error);
      },
    });
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.paginator.pageIndex = 0;
    this.loadProntuarios();
  }

  clearFilters(): void {
    this.filtroNome = '';
    this.filtroStatus = '';
    this.currentPage = 1;
    this.paginator.pageIndex = 0;
    this.loadProntuarios();
  }

  viewProntuario(id: number): void {
    this.router.navigate(['/prontuario-detail', id]);
  }

  getStatusClass(status: StatusProntuario): string {
    switch (status) {
      case StatusProntuario.ATIVO:
        return 'status-ativo';
      case StatusProntuario.INATIVO:
        return 'status-inativo';
      case StatusProntuario.ARQUIVADO:
        return 'status-arquivado';
      default:
        return '';
    }
  }

  displayedColumns: string[] = [
    'residenteNome',
    'status',
    'createdAt',
    'updatedAt',
    'acoes',
  ];
}
