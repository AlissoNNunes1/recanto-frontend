import { LiveAnnouncer } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule, SlicePipe, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ContentService } from '../../services/content.service';
import { AddResidentFormComponent } from '../add-resident-form/add-resident-form.component';
import { Resident } from '../resident';
import { ResidentsService } from '../residents.service';
import { UpdateResidentDialogComponent } from '../update-resident-dialog/update-resident-dialog.component';

@Component({
  selector: 'app-residents',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    SlicePipe,
  ],
  templateUrl: './residents.component.html',
  styleUrls: ['./residents.component.css'],
})
export class ResidentsComponent implements OnInit {
  residents: Resident[] = [];
  dataSource = new MatTableDataSource<Resident>(this.residents);
  selection = new SelectionModel<Resident>(true, []);
  isAdmin = false;
  private isBrowser: boolean;

  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  // Estados de carregamento e erro
  isLoading = false;
  hasError = false;
  errorMessage = '';
  totalItems = 0;

  // Controle de busca
  searchControl = new FormControl('');

  constructor(
    private residentsService: ResidentsService,
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    private contentService: ContentService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.dataSource.sort = this.sort;
    if (this.isBrowser) {
      this.isAdmin = localStorage.getItem('role') === 'admin';
    }
    this.setupSearchControl();
    this.getResidents();
  }

  /** Configura o controle de busca com debounce */
  private setupSearchControl(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => this.applyFilterByControl(searchTerm || ''));
  }

  private applyFilterByControl(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  announceSortChange(sortState: Sort): void {
    if (sortState.direction) {
      this._liveAnnouncer.announce(
        `Sorted by ${sortState.active} ${sortState.direction}`
      );
    } else {
      this._liveAnnouncer.announce('Sorting removed');
    }
  }

  getResidents(): void {
    this.isLoading = true;
    this.hasError = false;

    const cacheKey = 'residents';

    if (this.contentService.has(cacheKey)) {
      this.contentService.get<Resident[]>(cacheKey).subscribe({
        next: (cachedResidents) => {
          if (cachedResidents) {
            this.residents = cachedResidents;
            this.dataSource.data = this.residents;
            this.totalItems = this.residents.length;
          }
          this.isLoading = false;
        },
        error: () => this.loadResidentsFromService(),
      });
    } else {
      this.loadResidentsFromService();
    }
  }

  private loadResidentsFromService(): void {
    this.residentsService.getResidents().subscribe({
      next: (residents) => {
        this.residents = residents;
        this.dataSource.data = this.residents;
        this.totalItems = this.residents.length;
        this.contentService.set('residents', residents);
        this.isLoading = false;
        this.hasError = false;
      },
      error: (error) => {
        console.error('Erro ao carregar residentes:', error);
        this.hasError = true;
        this.errorMessage =
          'Erro ao carregar lista de residentes. Tente novamente.';
        this.isLoading = false;
      },
    });
  }

  refreshData(): void {
    this.contentService.clear();
    this.getResidents();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  viewResident(id: number): void {
    this.router.navigate(['/resident-detail', id]);
  }

  addResident(): void {
    const dialogRef = this.dialog.open(AddResidentFormComponent, {
      width: '90%',
      maxWidth: '800px',
      panelClass: 'responsive-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading = true;
        this.residentsService.createResident(result).subscribe({
          next: () => this.refreshData(),
          error: (error) => {
            console.error('Erro ao criar residente:', error);
            this.hasError = true;
            this.errorMessage = 'Erro ao criar residente. Tente novamente.';
            this.isLoading = false;
          },
        });
      }
    });
  }

  deleteResident(id: number): void {
    const confirmMessage =
      'Tem certeza que deseja deletar este residente? Esta ação não pode ser desfeita.';
    if (confirm(confirmMessage)) {
      this.isLoading = true;
      this.residentsService.deleteResident(id).subscribe({
        next: () => this.refreshData(),
        error: (error) => {
          console.error('Erro ao deletar residente:', error);
          this.hasError = true;
          this.errorMessage = 'Erro ao deletar residente. Tente novamente.';
          this.isLoading = false;
        },
      });
    }
  }

  updateResident(selectedResident: Resident): void {
    const dialogRef = this.dialog.open(UpdateResidentDialogComponent, {
      width: '90%',
      maxWidth: '800px',
      data: selectedResident,
      panelClass: 'responsive-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading = true;
        this.residentsService
          .updateResident(selectedResident.id, result)
          .subscribe({
            next: () => this.refreshData(),
            error: (error) => {
              console.error('Erro ao atualizar residente:', error);
              this.hasError = true;
              this.errorMessage =
                'Erro ao atualizar residente. Tente novamente.';
              this.isLoading = false;
            },
          });
      }
    });
  }

  // função para atualizar a pagina
  refresh(): void {
    window.location.reload();
  }

  formatCpf(cpf: string): string {
    if (!cpf) return '';
    return cpf.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, '$1.$2.$3-$4');
  }

  formatPhone(phone: string): string {
    if (!phone) return '';
    if (phone.length === 11) {
      return phone.replace(/(\\d{2})(\\d{5})(\\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\\d{2})(\\d{4})(\\d{4})/, '($1) $2-$3');
    }
    return phone;
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  displayedColumns: string[] = [
    'nome',
    'email',
    'cpf',
    'contatoEmergencia',
    'historicoMedico',
    'dataNascimento',
    'acoes',
  ];
}
