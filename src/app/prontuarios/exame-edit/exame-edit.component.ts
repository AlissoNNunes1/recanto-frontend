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
import { AnexosPreviewComponent } from '../../anexos-preview/anexos-preview.component';
import { AnexosUploadComponent } from '../../anexos-upload/anexos-upload.component';
import { TipoExame } from '../prontuario';
import { ProntuariosService } from '../prontuarios.service';

@Component({
  selector: 'app-exame-edit',
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
    AnexosUploadComponent,
    AnexosPreviewComponent,
  ],
  templateUrl: './exame-edit.component.html',
  styleUrls: ['./exame-edit.component.css'],
})
export class ExameEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private prontuariosService = inject(ProntuariosService);
  private snackBar = inject(MatSnackBar);

  exameForm!: FormGroup;
  exameId!: number;
  prontuarioId!: number;
  loading = false;

  tiposExame = Object.values(TipoExame);

  ngOnInit(): void {
    this.exameId = Number(this.route.snapshot.paramMap.get('exameId'));
    this.prontuarioId = Number(
      this.route.snapshot.paramMap.get('prontuarioId')
    );

    this.initForm();
    this.loadExame();
  }

  private initForm(): void {
    this.exameForm = this.fb.group({
      profissionalSolicitanteId: ['', Validators.required],
      tipoExame: ['', Validators.required],
      nomeExame: ['', Validators.required],
      descricao: [''],
      dataSolicitacao: ['', Validators.required],
      observacoes: [''],
    });
  }

  private loadExame(): void {
    this.loading = true;
    this.prontuariosService.getExame(this.exameId).subscribe({
      next: (exame) => {
        this.exameForm.patchValue({
          profissionalSolicitanteId: exame.profissionalSolicitanteId,
          tipoExame: exame.tipoExame,
          nomeExame: exame.nomeExame,
          descricao: exame.descricao,
          dataSolicitacao: new Date(exame.dataSolicitacao),
          observacoes: exame.observacoes,
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar exame:', error);
        this.showError('Erro ao carregar dados do exame');
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.exameForm.valid) {
      this.loading = true;
      const formData = this.exameForm.value;

      this.prontuariosService.updateExame(this.exameId, formData).subscribe({
        next: () => {
          this.showSuccess('Exame atualizado com sucesso!');
          this.router.navigate(['/prontuario-detail', this.prontuarioId]);
        },
        error: (error) => {
          console.error('Erro ao atualizar exame:', error);
          this.showError('Erro ao atualizar exame. Tente novamente.');
          this.loading = false;
        },
      });
    } else {
      this.markFormGroupTouched(this.exameForm);
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
