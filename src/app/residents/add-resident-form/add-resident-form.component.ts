import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-resident-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-resident-form.component.html',
  styleUrls: ['./add-resident-form.component.css']
})
export class AddResidentFormComponent implements OnInit {
  residentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddResidentFormComponent>
  ) {
    this.residentForm = this.fb.group({
      name: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      rg: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      emergency_contact: ['', Validators.required],
      birth_date: ['', Validators.required],
      medical_history: [''],
      photo: ['']
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    console.log('Form Submitted', this.residentForm.value);
    if (this.residentForm.valid) {
      console.log('Form is valid, closing dialog with result:', this.residentForm.value);
      this.dialogRef.close(this.residentForm.value);
    } else {
      console.log('Formulário inválido');
    }
  }
}
