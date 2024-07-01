import { Component, OnInit, AfterViewInit,ViewChild } from '@angular/core';
import { ResidentsService } from '../residents.service';
import { Resident } from '../resident';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { AddResidentFormComponent } from '../add-resident-form/add-resident-form.component';
import { DatePipe, CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service';
import { UpdateResidentDialogComponent } from '../update-resident-dialog/update-resident-dialog.component';
import { Router } from '@angular/router';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSort, Sort,MatSortModule } from '@angular/material/sort';


@Component({
  selector: 'app-residents',
  standalone: true,
  imports: [DatePipe, CommonModule, MatDialogModule, MatTableModule, MatSortModule],
  templateUrl: './residents.component.html',
  styleUrls: ['./residents.component.css']
})
export class ResidentsComponent implements OnInit {
  residents: Resident[] = [];
  dataSource = new MatTableDataSource<Resident>(this.residents);
  selection = new SelectionModel<Resident>(true, []);
  isAdmin: boolean = false;

 @ViewChild(MatSort, { static: true }) sort!: MatSort;
  constructor(private residentsService: ResidentsService,private _liveAnnoucer: LiveAnnouncer, public dialog: MatDialog, private contentService: ContentService, private router: Router) { }

  
  ngOnInit(): void {
    this.dataSource.sort = this.sort;
    this.getResidents();
    this.isAdmin = localStorage.getItem('role') === 'admin';
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnoucer.announce(`Sorted by ${sortState.active} ${sortState.direction}`);
    } else {
      this._liveAnnoucer.announce(`Sorting removed`);
    }
  }

  getResidents(): void {
    const cacheKey = 'residents';
    if (this.contentService.has(cacheKey)) {
      this.contentService.get<Resident[]>(cacheKey).subscribe(cachedResidents => {
        if (cachedResidents) {
          this.residents = cachedResidents;
          this.dataSource.data = this.residents;
        }
      });
    } else {
      this.residentsService.getResidents().subscribe(residents => {
        this.residents = residents;
        this.dataSource.data = this.residents;
        this.contentService.set(cacheKey, residents); // Armazena os dados no cache
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  viewResident(id: number): void {
    this.router.navigate(['/resident-detail', id]);
  }

  addResident(): void {
    const dialogRef = this.dialog.open(AddResidentFormComponent, {
      width: '73%',
      height: '73%',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with result:', result);
      if (result) {
        this.residentsService.createResident(result).subscribe(() => {
          console.log('Resident created successfully');
          this.getResidents(); // Atualiza a lista de residentes após adicionar um novo residente
          this.refresh();
        });
      }
    });
  }

  deleteResident(id: number): void {
    if (confirm('Are you sure you want to delete this resident?')) {
      this.residentsService.deleteResident(id).subscribe(() => {
        this.getResidents();
        // atualiza a pagina depois de deletar
        this.refresh();
      });
    }
  }
  updateResident(selectedResident: Resident): void {
    const dialogRef = this.dialog.open(UpdateResidentDialogComponent, {
      width: '73%',
      height: '73%',
      data: selectedResident
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        this.residentsService.updateResident(selectedResident.id, result).subscribe(() => {
          this.getResidents();
          this.refresh();
        });
      }
    });
  }
  
  //função para atualizar a pagina 
  refresh(): void {
    window.location.reload();
  }


  // Métodos para seleção (se necessário)
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  displayedColumns: string[] = ['nome', 'email', 'cpf', 'contatoEmergencia', 'historicoMedico', 'dataNascimento', 'acoes'];
}
