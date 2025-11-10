import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ProntuarioCreate } from '../prontuario';
import { ProntuariosService } from '../prontuarios.service';

@Component({
  selector: 'app-prontuario-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './prontuario-form.component.html',
  styleUrls: ['./prontuario-form.component.css'],
})
export class ProntuarioFormComponent implements OnInit {
  prontuarioForm!: FormGroup;
  residenteId!: number;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private prontuariosService: ProntuariosService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('residenteId');
    if (id) {
      this.residenteId = Number(id);
    } else {
      this.showError('ID do residente nao encontrado');
      this.goBack();
      return;
    }

    this.initForm();
  }

  initForm(): void {
    this.prontuarioForm = this.fb.group({
      historicoMedico: [''],
      alergias: [''],
      medicamentosContinuos: [''],
      restricoesAlimentares: [''],
      historicoFamiliar: [''],
      observacoes: [''],
    });
  }

  onSubmit(): void {
    if (this.prontuarioForm.invalid) {
      this.markFormGroupTouched(this.prontuarioForm);
      this.showError('Por favor, verifique os campos do formulario');
      return;
    }

    this.loading = true;

    const prontuarioData: ProntuarioCreate = {
      residenteId: this.residenteId,
      ...this.prontuarioForm.value,
    };

    this.prontuariosService.createProntuario(prontuarioData).subscribe({
      next: (prontuario) => {
        this.showSuccess('Prontuario criado com sucesso');
        this.router.navigate(['/prontuario-detail', prontuario.id]);
      },
      error: (error) => {
        console.error('Erro ao criar prontuario:', error);
        this.showError(
          error.error?.message || 'Erro ao criar prontuario'
        );
        this.loading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/residents']);
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

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.prontuarioForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Campo obrigatorio';
    }
    return '';
  }
}

// Componente de formulario para criacao de prontuario eletronico
// Permite criar novo prontuario vinculado a um residente
// Campos opciona is para historico medico, alergias, medicamentos, restricoes
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
