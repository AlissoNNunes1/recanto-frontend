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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AllergyWarningDialogComponent } from '../allergy-warning-dialog/allergy-warning-dialog.component';
import { MedicamentoPrescrito, ProntuarioEletronico } from '../prontuario';
import { ProntuariosService } from '../prontuarios.service';

@Component({
  selector: 'app-medicamento-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './medicamento-edit.component.html',
  styleUrls: ['./medicamento-edit.component.css'],
})
export class MedicamentoEditComponent implements OnInit {
  medicamentoForm!: FormGroup;
  prontuarioId!: number;
  medicamentoId!: number;
  prontuario: ProntuarioEletronico | null = null;
  medicamento: MedicamentoPrescrito | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private prontuariosService: ProntuariosService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const prontuarioIdParam = this.route.snapshot.paramMap.get('prontuarioId');
    const medicamentoIdParam = this.route.snapshot.paramMap.get('id');

    if (prontuarioIdParam && medicamentoIdParam) {
      this.prontuarioId = Number(prontuarioIdParam);
      this.medicamentoId = Number(medicamentoIdParam);
      this.loadProntuario();
      this.loadMedicamento();
    } else {
      this.showError('IDs nao encontrados');
      this.goBack();
      return;
    }

    this.initForm();
  }

  loadProntuario(): void {
    this.prontuariosService.getProntuario(this.prontuarioId).subscribe({
      next: (prontuario) => {
        this.prontuario = prontuario;
      },
      error: (error) => {
        console.error('Erro ao carregar prontuario:', error);
      },
    });
  }

  loadMedicamento(): void {
    this.prontuariosService.getMedicamento(this.medicamentoId).subscribe({
      next: (medicamento) => {
        this.medicamento = medicamento;
        this.populateForm(medicamento);
      },
      error: (error) => {
        console.error('Erro ao carregar medicamento:', error);
        this.showError('Erro ao carregar medicamento');
        this.goBack();
      },
    });
  }

  populateForm(medicamento: MedicamentoPrescrito): void {
    this.medicamentoForm.patchValue({
      profissionalId: medicamento.profissionalId,
      medicamentoNome: medicamento.medicamentoNome,
      dosagem: medicamento.dosagem,
      viaAdministracao: medicamento.viaAdministracao,
      frequenciaAdministracao: medicamento.frequenciaAdministracao,
      indicacaoClinica: medicamento.indicacaoClinica,
      instrucoesUso: medicamento.instrucoesUso,
      dataInicio: medicamento.dataInicio
        ? new Date(medicamento.dataInicio)
        : null,
      dataFim: medicamento.dataFim ? new Date(medicamento.dataFim) : null,
      quantidade: medicamento.quantidade,
      observacoes: medicamento.observacoes,
    });
  }

  initForm(): void {
    this.medicamentoForm = this.fb.group({
      profissionalId: [null, Validators.required],
      medicamentoNome: ['', Validators.required],
      dosagem: ['', Validators.required],
      viaAdministracao: ['', Validators.required],
      frequenciaAdministracao: ['', Validators.required],
      indicacaoClinica: ['', Validators.required],
      instrucoesUso: [''],
      dataInicio: [new Date(), Validators.required],
      dataFim: [null],
      quantidade: [''],
      observacoes: [''],
    });
  }

  onSubmit(): void {
    if (this.medicamentoForm.invalid) {
      this.markFormGroupTouched(this.medicamentoForm);
      this.showError('Por favor, preencha todos os campos obrigatorios');
      return;
    }

    const medicamentoNome = this.medicamentoForm.get('medicamentoNome')?.value;

    // Verificar alergias antes de submeter
    if (this.prontuario?.alergias && this.prontuario.alergias.length > 0) {
      const alergiaDetectada = this.checkAllergies(medicamentoNome);

      if (alergiaDetectada.length > 0) {
        this.showAllergyWarning(medicamentoNome, alergiaDetectada);
        return;
      }
    }

    this.submitMedicamento();
  }

  checkAllergies(medicamentoNome: string): string[] {
    if (!this.prontuario?.alergias) return [];

    const medicamentoLower = medicamentoNome.toLowerCase();
    const alergiasFiltradas: string[] = [];

    for (const alergia of this.prontuario.alergias) {
      const alergiaLower = alergia.toLowerCase();

      // Verificar se alguma palavra da alergia esta no nome do medicamento
      const palavrasAlergia = alergiaLower.split(/[\s,;]+/);
      const palavrasMedicamento = medicamentoLower.split(/[\s,;]+/);

      for (const palavraAlergia of palavrasAlergia) {
        if (palavraAlergia.length > 3) {
          // Ignorar palavras muito curtas
          for (const palavraMed of palavrasMedicamento) {
            if (
              palavraMed.includes(palavraAlergia) ||
              palavraAlergia.includes(palavraMed)
            ) {
              alergiasFiltradas.push(alergia);
              break;
            }
          }
        }
      }
    }

    return alergiasFiltradas;
  }

  showAllergyWarning(medicamentoNome: string, alergias: string[]): void {
    const dialogRef = this.dialog.open(AllergyWarningDialogComponent, {
      width: '500px',
      data: {
        medicamentoNome,
        alergias,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.submitMedicamento();
      }
    });
  }

  submitMedicamento(): void {
    this.loading = true;

    const medicamentoData: Partial<MedicamentoPrescrito> = {
      profissionalId: this.medicamentoForm.value.profissionalId,
      medicamentoNome: this.medicamentoForm.value.medicamentoNome,
      dosagem: this.medicamentoForm.value.dosagem,
      viaAdministracao: this.medicamentoForm.value.viaAdministracao,
      frequenciaAdministracao:
        this.medicamentoForm.value.frequenciaAdministracao,
      indicacaoClinica: this.medicamentoForm.value.indicacaoClinica,
      instrucoesUso: this.medicamentoForm.value.instrucoesUso,
      dataInicio: this.medicamentoForm.value.dataInicio,
      dataFim: this.medicamentoForm.value.dataFim,
      quantidade: this.medicamentoForm.value.quantidade,
      observacoes: this.medicamentoForm.value.observacoes,
    };

    this.prontuariosService
      .updateMedicamento(this.medicamentoId, medicamentoData)
      .subscribe({
        next: () => {
          this.showSuccess('Medicamento atualizado com sucesso');
          this.goBack();
        },
        error: (error) => {
          console.error('Erro ao atualizar medicamento:', error);
          this.showError(
            error.error?.message || 'Erro ao atualizar medicamento'
          );
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
    const control = this.medicamentoForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Campo obrigatorio';
    }
    return '';
  }
}

// Componente para edicao de medicamentos prescritos
// Permite editar prescricoes existentes de um prontuario
// Inclui validacao de alergias antes de salvar alteracoes
// Validacoes de campos obrigatorios e feedback visual
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
