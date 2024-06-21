import { Component, OnInit } from '@angular/core';
import { ResidentsService } from '../residents.service';
import { Resident } from '../resident';
import { AuthService } from '../../auth/auth.service';
import { DatePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-residents',
  standalone: true,
  imports: [ DatePipe, CommonModule ],
  templateUrl: './residents.component.html',
  styleUrl: './residents.component.css'
})
export class ResidentsComponent implements OnInit {
  residents: Resident[] = [];
  isAdmin: boolean = false;

  constructor(private residentsService: ResidentsService, ) { }

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