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
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AllergyWarningDialogComponent } from '../allergy-warning-dialog/allergy-warning-dialog.component';
import { MedicamentoPrescrito, ProntuarioEletronico } from '../prontuario';
import { ProntuariosService } from '../prontuarios.service';

// Enums para validacao
export enum ViaAdministracao {
  ORAL = 'ORAL',
  INJETAVEL = 'INJETAVEL',
  TOPICA = 'TOPICA',
  INALATORIA = 'INALATORIA',
  OFTALMICA = 'OFTALMICA',
  OTOLOGICA = 'OTOLOGICA',
  RETAL = 'RETAL',
  VAGINAL = 'VAGINAL',
  OUTROS = 'OUTROS',
}

export enum FrequenciaAdministracao {
  UMA_VEZ = 'UMA_VEZ',
  DIARIA = 'DIARIA',
  BID = 'BID',
  TID = 'TID',
  QID = 'QID',
  SOS = 'SOS',
  SEMANAL = 'SEMANAL',
  MENSAL = 'MENSAL',
  OUTROS = 'OUTROS',
}

@Component({
  selector: 'app-medicamento-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
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

  // Opcoes dos dropdowns com labels amigaveis
  viasAdministracao = [
    { value: ViaAdministracao.ORAL, label: 'Oral (Via oral)' },
    { value: ViaAdministracao.INJETAVEL, label: 'Injetavel (IM/IV/SC)' },
    { value: ViaAdministracao.TOPICA, label: 'Topica (Pele)' },
    { value: ViaAdministracao.INALATORIA, label: 'Inalatoria (Nebulizacao)' },
    { value: ViaAdministracao.OFTALMICA, label: 'Oftalmica (Colirio)' },
    { value: ViaAdministracao.OTOLOGICA, label: 'Otologica (Ouvido)' },
    { value: ViaAdministracao.RETAL, label: 'Retal (Supositorio)' },
    { value: ViaAdministracao.VAGINAL, label: 'Vaginal (Ovulo)' },
    { value: ViaAdministracao.OUTROS, label: 'Outras vias' },
  ];

  frequenciasAdministracao = [
    { value: FrequenciaAdministracao.UMA_VEZ, label: 'Uma vez (Dose unica)' },
    { value: FrequenciaAdministracao.DIARIA, label: 'Diaria (1x ao dia)' },
    { value: FrequenciaAdministracao.BID, label: 'BID (2x ao dia / 12/12h)' },
    { value: FrequenciaAdministracao.TID, label: 'TID (3x ao dia / 8/8h)' },
    { value: FrequenciaAdministracao.QID, label: 'QID (4x ao dia / 6/6h)' },
    { value: FrequenciaAdministracao.SOS, label: 'SOS (Se necessario)' },
    {
      value: FrequenciaAdministracao.SEMANAL,
      label: 'Semanal (1x por semana)',
    },
    { value: FrequenciaAdministracao.MENSAL, label: 'Mensal (1x por mes)' },
    { value: FrequenciaAdministracao.OUTROS, label: 'Outras frequencias' },
  ];

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
    const medicamentoIdParam =
      this.route.snapshot.paramMap.get('medicamentoId');

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
        console.log('Prontuario carregado:', prontuario);
        console.log('Alergias registradas:', prontuario.alergias);
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
    if (
      this.prontuario?.alergias &&
      this.prontuario.alergias.trim().length > 0
    ) {
      const alergiaDetectada = this.checkAllergies(medicamentoNome);

      if (alergiaDetectada.length > 0) {
        this.showAllergyWarning(medicamentoNome, alergiaDetectada);
        return;
      }
    }

    this.submitMedicamento();
  }

  checkAllergies(medicamentoNome: string): string[] {
    if (!this.prontuario?.alergias || this.prontuario.alergias.trim() === '') {
      console.log('Nenhuma alergia registrada no prontuario');
      return [];
    }

    console.log('Verificando alergias para medicamento:', medicamentoNome);
    console.log('Alergias do prontuario:', this.prontuario.alergias);

    const medicamentoLower = medicamentoNome.toLowerCase().trim();
    const alergiasFiltradas: string[] = [];

    // Converter string de alergias em array (separado por virgula, ponto-virgula ou quebra de linha)
    const listaAlergias = this.prontuario.alergias
      .split(/[,;\n]+/)
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    console.log('Lista de alergias processada:', listaAlergias);

    for (const alergia of listaAlergias) {
      const alergiaLower = alergia.toLowerCase();

      // Verificar se alguma palavra da alergia esta no nome do medicamento
      const palavrasAlergia = alergiaLower
        .split(/[\s,;]+/)
        .filter((p) => p.length > 3);
      const palavrasMedicamento = medicamentoLower
        .split(/[\s,;]+/)
        .filter((p) => p.length > 2);

      console.log(`Comparando alergia "${alergia}":`, {
        palavrasAlergia,
        palavrasMedicamento,
      });

      for (const palavraAlergia of palavrasAlergia) {
        for (const palavraMed of palavrasMedicamento) {
          // Verificar correspondencia parcial (minimo 4 caracteres em comum)
          if (
            palavraMed.includes(palavraAlergia) ||
            palavraAlergia.includes(palavraMed)
          ) {
            console.log(
              `ALERGIA DETECTADA: "${palavraMed}" combina com "${palavraAlergia}"`
            );
            alergiasFiltradas.push(alergia);
            break;
          }
        }
        if (alergiasFiltradas.includes(alergia)) break;
      }
    }

    console.log('Alergias detectadas:', alergiasFiltradas);
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
