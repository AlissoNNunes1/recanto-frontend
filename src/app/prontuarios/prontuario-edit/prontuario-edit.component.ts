import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ProntuarioUpdate } from '../prontuario';
import { ProntuariosService } from '../prontuarios.service';

@Component({
  selector: 'app-prontuario-edit',
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
  templateUrl: './prontuario-edit.component.html',
  styleUrls: ['./prontuario-edit.component.css'],
})
export class ProntuarioEditComponent implements OnInit {
  prontuarioForm!: FormGroup;
  prontuarioId!: number;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private prontuariosService: ProntuariosService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.showError('ID do prontuario nao encontrado');
      this.router.navigate(['/prontuarios']);
      return;
    }

    this.prontuarioId = parseInt(id, 10);
    this.initForm();
    this.loadProntuario();
  }

  private initForm(): void {
    this.prontuarioForm = this.fb.group({
      historicoMedico: [''],
      alergias: [''],
      medicamentosContinuos: [''],
      restricoesAlimentares: [''],
      historicoFamiliar: [''],
      observacoes: [''],
    });
  }

  private loadProntuario(): void {
    this.loading = true;

    this.prontuariosService.getProntuario(this.prontuarioId).subscribe({
      next: (prontuario) => {
        this.prontuarioForm.patchValue({
          historicoMedico: prontuario.historicoMedico || '',
          alergias: prontuario.alergias || '',
          medicamentosContinuos: prontuario.medicamentosContinuos || '',
          restricoesAlimentares: prontuario.restricoesAlimentares || '',
          historicoFamiliar: prontuario.historicoFamiliar || '',
          observacoes: prontuario.observacoes || '',
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar prontuario:', error);
        this.showError('Erro ao carregar prontuario');
        this.loading = false;
        this.router.navigate(['/prontuarios']);
      },
    });
  }

  onSubmit(): void {
    if (this.prontuarioForm.invalid) {
      this.markFormGroupTouched(this.prontuarioForm);
      return;
    }

    this.loading = true;
    const formValue = this.prontuarioForm.value;

    const prontuarioUpdate: ProntuarioUpdate = {
      historicoMedico: formValue.historicoMedico || undefined,
      alergias: formValue.alergias || undefined,
      medicamentosContinuos: formValue.medicamentosContinuos || undefined,
      restricoesAlimentares: formValue.restricoesAlimentares || undefined,
      historicoFamiliar: formValue.historicoFamiliar || undefined,
      observacoes: formValue.observacoes || undefined,
    };

    this.prontuariosService
      .updateProntuario(this.prontuarioId, prontuarioUpdate)
      .subscribe({
        next: (response) => {
          this.showSuccess('Prontuario atualizado com sucesso!');
          this.loading = false;
          this.router.navigate(['/prontuario-detail', this.prontuarioId]);
        },
        error: (error) => {
          console.error('Erro ao atualizar prontuario:', error);
          this.showError('Erro ao atualizar prontuario. Tente novamente.');
          this.loading = false;
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/prontuario-detail', this.prontuarioId]);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
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

  getErrorMessage(field: string): string {
    const control = this.prontuarioForm.get(field);
    if (control?.hasError('required')) {
      return 'Este campo e obrigatorio';
    }
    return '';
  }
}

/*
   __  ____ ____ _  _
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
