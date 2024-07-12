import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-add-resident-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    CommonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-resident-form.component.html',
  styleUrls: ['./add-resident-form.component.css'],
  animations: [
    trigger('transitionMessages', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-100%)' }),
        animate('0.5s', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('0.5s', style({ opacity: 0, transform: 'translateY(-100%)' }))
      ]),
    ]),
  ]
})
export class AddResidentFormComponent implements OnInit {
  residentForm: FormGroup;
  selectedFile: File | null = null;

  protected readonly value = signal('');

  protected onInput(event: Event) {
    this.value.set((event.target as HTMLInputElement).value);
  }

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddResidentFormComponent>
  ) {
    this.residentForm = this.fb.group({
      nome: ['', Validators.required],
      sexo: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      contatoEmergencia: ['', Validators.required],
      dataNascimento: ['', Validators.required],
      historicoMedico: [''],
      foto: ['']
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.residentForm.valid) {
      const formData = { ...this.residentForm.value, foto: this.selectedFile };
      console.log('Form Submitted', formData);
      this.dialogRef.close(formData);
    } else {
      console.log('Formulário inválido');
    }
  }
}
