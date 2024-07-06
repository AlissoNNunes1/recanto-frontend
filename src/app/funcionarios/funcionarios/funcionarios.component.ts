import { Component, OnInit, ViewChild } from '@angular/core';
import { FuncionariosService } from '../funcionarios.service';
import { Funcionario } from '../funcionario';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe, CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service';
import { Router } from '@angular/router';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [DatePipe, CommonModule, MatDialogModule, MatSortModule, MatCardModule, MatGridListModule, MatIconModule],
  templateUrl: './funcionarios.component.html',
  styleUrls: ['./funcionarios.component.css']
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
      this._liveAnnouncer.announce(`Sorted by ${sortState.active} ${sortState.direction}`);
    } else {
      this._liveAnnouncer.announce(`Sorting removed`);
    }
  }

  getFuncionarios(): void {
    const cacheKey = 'funcionarios';
    if (this.contentService.has(cacheKey)) {
      this.contentService.get<Funcionario[]>(cacheKey).subscribe(cachedFuncionarios => {
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
    this.router.navigate(['/funcionarios/create']);
  }

  viewFuncionario(id: number): void {
    this.router.navigate(['/funcionarios/detail', id]);
  }

  updateFuncionario(funcionario: Funcionario): void {
    // Implementar a função de atualização de funcionário
  }

  deleteFuncionario(id: number): void {
    // Implementar a função de deleção de funcionário
  }
}
