import { Component, Inject, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-atribuirusuario',
  standalone: true,
  imports: [],
  templateUrl: './atribuirusuario.component.html',
  styleUrl: './atribuirusuario.component.css'
})
export class AtribuirusuarioComponent {
  constructor(
    public dialogRef: MatDialogRef<AtribuirusuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {nome: string, email: string, senha: string, role: string, username: string}
  ) {}
}
