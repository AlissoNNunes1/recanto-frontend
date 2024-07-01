import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResidentsService } from '../residents.service';
import { Resident } from '../resident';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-update-resident-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './update-resident-dialog.component.html',
  styleUrls: ['./update-resident-dialog.component.css']
})
export class UpdateResidentDialogComponent implements OnInit {
  updateResidentForm: FormGroup;
  selectedFile: File | null = null;
  constructor(
    public dialogRef: MatDialogRef<UpdateResidentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Resident,
    private fb: FormBuilder,
    private residentsService: ResidentsService
  ) {
    this.updateResidentForm = this.fb.group({
      nome: [data.nome, Validators.required],
      sexo: [data.sexo, Validators.required],
      cpf: [data.cpf, [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      email: [data.email, [Validators.required, Validators.email]],
      contatoEmergencia: [data.contatoEmergencia, Validators.required],
      dataNascimento: [data.dataNascimento, Validators.required],
      historicoMedico: [data.historicoMedico],
      foto: [data.foto]
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
    if (this.updateResidentForm.valid && this.selectedFile) {
      
      this.dialogRef.close(this.updateResidentForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
