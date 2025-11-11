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
import { ConsultaCreate, StatusConsulta, TipoConsulta } from '../prontuario';
import { ProntuariosService } from '../prontuarios.service';

@Component({
  selector: 'app-consulta-form',
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
  templateUrl: './consulta-form.component.html',
  styleUrls: ['./consulta-form.component.css'],
})
export class ConsultaFormComponent implements OnInit {
  consultaForm!: FormGroup;
  prontuarioId!: number;
  consultaId?: number;
  loading = false;
  consultaSalva = false;

  tiposConsulta = Object.values(TipoConsulta);
  statusConsulta = Object.values(StatusConsulta);

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
    this.consultaForm = this.fb.group({
      profissionalId: [null, Validators.required],
      tipoConsulta: ['', Validators.required],
      dataConsulta: [new Date(), Validators.required],
      observacoes: [''],
    });
  }

  onSubmit(): void {
    if (this.consultaForm.invalid) {
      this.markFormGroupTouched(this.consultaForm);
      this.showError('Por favor, preencha todos os campos obrigatorios');
      return;
    }

    this.loading = true;

    const consultaData: ConsultaCreate = {
      prontuarioId: this.prontuarioId,
      ...this.consultaForm.value,
    };

    this.prontuariosService
      .createConsulta(this.prontuarioId, consultaData)
      .subscribe({
        next: (response: any) => {
          this.consultaId = response.id;
          this.consultaSalva = true;
          this.showSuccess(
            'Consulta registrada com sucesso! Agora voce pode anexar arquivos.'
          );
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao registrar consulta:', error);
          this.showError(error.error?.message || 'Erro ao registrar consulta');
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
    this.showSuccess('Consulta registrada com anexos!');
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
    const control = this.consultaForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Campo obrigatorio';
    }
    return '';
  }
}

// Formulario para registro de consultas medicas
// Permite adicionar nova consulta a um prontuario existente
// Validacoes de campos obrigatorios e feedback visual
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
