import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Importar Router
import { ResidentsService } from '../residents.service';
import { Resident } from '../resident';
import { CommonModule } from '@angular/common'; // Importar CommonModule

@Component({
  selector: 'app-resident-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resident-detail.component.html',
  styleUrls: ['./resident-detail.component.css'] // Corrigido para styleUrls
})
export class ResidentDetailComponent implements OnInit {

  resident!: Resident;

  constructor(
    private route: ActivatedRoute,
    private residentsService: ResidentsService,
    private router: Router // Injetar o Router
  ) { }

  ngOnInit(): void {
    const residentId = Number(this.route.snapshot.paramMap.get('id'));
    if (residentId) {
      this.getResidentDetails(residentId);
    }
  }

  getResidentDetails(id: number): void {
    this.residentsService.getResident(id).subscribe(resident => {
      this.resident = resident;
    });
  }

  date(): string {
    if (this.resident && this.resident.dataNascimento) {
      const date = new Date(this.resident.dataNascimento);
      return date.toLocaleDateString();
    }
    return '';
  }

  goBack(): void { // Método goBack implementado
    this.router.navigate(['/residents']); // Ajuste conforme a rota correta
  }
}