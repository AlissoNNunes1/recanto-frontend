import { Component, OnInit } from '@angular/core';
import { ResidentsService } from '../residents.service';
import { Resident } from '../resident';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddResidentFormComponent } from '../add-resident-form/add-resident-form.component';
import { DatePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-residents',
  standalone: true,
  imports: [DatePipe, CommonModule, MatDialogModule],
  templateUrl: './residents.component.html',
  styleUrls: ['./residents.component.css']
})
export class ResidentsComponent implements OnInit {
  residents: Resident[] = [];
  isAdmin: boolean = false;

  constructor(private residentsService: ResidentsService, public dialog: MatDialog) { }

  addResident(): void {
    
    const dialogRef = this.dialog.open(AddResidentFormComponent, {
      width: '96%',
      height: '96%',
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with result:', result);
      if (result) {
        this.residentsService.createResident(result).subscribe(() => {
          console.log('Resident created successfully');
          this.getResidents(); // Atualiza a lista de residentes após adicionar um novo residente
        });
      }
    });
  }

  ngOnInit(): void {
    this.getResidents();
    this.isAdmin = localStorage.getItem('role') === 'adm';
  }

  getResidents(): void {
    this.residentsService.getResidents().subscribe(residents => {
      this.residents = residents;
    });
  }

  deleteResident(id: number): void {
    if (confirm('Are you sure you want to delete this resident?')) {
      this.residentsService.deleteResident(id).subscribe(() => {
        this.getResidents();
      });
    }
  }
}
