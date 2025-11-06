import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ProntuariosService } from '../prontuarios.service';

@Component({
  selector: 'app-consulta-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './consulta-edit.component.html',
  styleUrls: ['./consulta-edit.component.css'],
})
export class ConsultaEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private prontuariosService = inject(ProntuariosService);
  private snackBar = inject(MatSnackBar);

  consultaForm!: FormGroup;
  consultaId!: number;
  prontuarioId!: number;
  loading = false;

  tiposConsulta = [
    'Rotina',
    'Emergencia',
    'Retorno',
    'Avaliacao Inicial',
    'Acompanhamento',
  ];

  ngOnInit(): void {
    // Obter IDs da rota
    this.consultaId = Number(this.route.snapshot.paramMap.get('consultaId'));
    this.prontuarioId = Number(
      this.route.snapshot.paramMap.get('prontuarioId')
    );

    this.initForm();
    this.loadConsulta();
  }

  private initForm(): void {
    this.consultaForm = this.fb.group({
      profissionalId: ['', Validators.required],
      tipoConsulta: ['', Validators.required],
      dataConsulta: ['', Validators.required],
      queixaPrincipal: ['', Validators.required],
      historiaDoencaAtual: [''],
      exameFisico: [''],
      hipoteseDiagnostica: [''],
      diagnostico: [''],
      tratamento: [''],
      observacoes: [''],
    });
  }

  private loadConsulta(): void {
    this.loading = true;
    this.prontuariosService.getConsulta(this.consultaId).subscribe({
      next: (consulta) => {
        this.consultaForm.patchValue({
          profissionalId: consulta.profissionalId,
          tipoConsulta: consulta.tipoConsulta,
          dataConsulta: new Date(consulta.dataConsulta),
          queixaPrincipal: consulta.queixaPrincipal,
          historiaDoencaAtual: consulta.historiaDoencaAtual,
          exameFisico: consulta.exameFisico,
          hipoteseDiagnostica: consulta.hipoteseDiagnostica,
          diagnostico: consulta.diagnostico,
          tratamento: consulta.tratamento,
          observacoes: consulta.observacoes,
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar consulta:', error);
        this.showError('Erro ao carregar dados da consulta');
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.consultaForm.valid) {
      this.loading = true;
      const formData = {
        ...this.consultaForm.value,
        prontuarioId: this.prontuarioId,
      };

      this.prontuariosService
        .updateConsulta(this.consultaId, formData)
        .subscribe({
          next: () => {
            this.showSuccess('Consulta atualizada com sucesso!');
            this.router.navigate(['/prontuario-detail', this.prontuarioId]);
          },
          error: (error) => {
            console.error('Erro ao atualizar consulta:', error);
            this.showError('Erro ao atualizar consulta. Tente novamente.');
            this.loading = false;
          },
        });
    } else {
      this.markFormGroupTouched(this.consultaForm);
      this.showError('Por favor, preencha todos os campos obrigatorios.');
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/prontuario-detail', this.prontuarioId]);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-success'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-error'],
    });
  }
}

//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
