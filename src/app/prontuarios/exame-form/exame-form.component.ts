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
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AnexosUploadComponent } from '../../anexos-upload/anexos-upload.component';
import { Anexo } from '../../services/anexos.service';
import { ExameCreate, TipoExame } from '../prontuario';
import { ProntuariosService } from '../prontuarios.service';

@Component({
  selector: 'app-exame-form',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    AnexosUploadComponent,
  ],
  templateUrl: './exame-form.component.html',
  styleUrls: ['./exame-form.component.css'],
})
export class ExameFormComponent implements OnInit {
  exameForm!: FormGroup;
  prontuarioId!: number;
  exameId?: number;
  loading = false;
  exameSalvo = false;

  tiposExame = Object.values(TipoExame);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private prontuariosService: ProntuariosService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('prontuarioId');
    if (id) {
      this.prontuarioId = Number(id);
    } else {
      this.showError('ID do prontuario nao encontrado');
      this.goBack();
      return;
    }

    this.initForm();
  }

  initForm(): void {
    this.exameForm = this.fb.group({
      tipoExame: ['', Validators.required],
      nomeExame: ['', Validators.required],
      descricao: [''],
      dataSolicitacao: [new Date(), Validators.required],
      observacoes: [''],
    });
  }

  onSubmit(): void {
    if (this.exameForm.invalid) {
      this.markFormGroupTouched(this.exameForm);
      this.showError('Por favor, preencha todos os campos obrigatorios');
      return;
    }

    this.loading = true;

    const exameData: ExameCreate = {
      prontuarioId: this.prontuarioId,
      ...this.exameForm.value,
    };

    this.prontuariosService
      .createExame(this.prontuarioId, exameData)
      .subscribe({
        next: (response: any) => {
          this.exameId = response.id;
          this.exameSalvo = true;
          this.showSuccess(
            'Exame registrado com sucesso! Agora voce pode anexar arquivos.'
          );
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao registrar exame:', error);
          this.showError(error.error?.message || 'Erro ao registrar exame');
          this.loading = false;
        },
      });
  }

  onUploadCompleto(anexo: Anexo): void {
    this.showSuccess(`Arquivo "${anexo.nomeArquivo}" enviado com sucesso`);
  }

  onUploadErro(erro: string): void {
    this.showError(erro);
  }

  finalizar(): void {
    this.showSuccess('Exame registrado com anexos!');
    this.goBack();
  }

  goBack(): void {
    this.router.navigate(['/prontuario-detail', this.prontuarioId]);
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
    const control = this.exameForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Campo obrigatorio';
    }
    return '';
  }
}

// Formulario para solicitacao de exames medicos
// Permite adicionar nova solicitacao de exame a um prontuario
// Validacoes de campos obrigatorios e feedback visual
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
