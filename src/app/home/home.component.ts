import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Importar CommonModule



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule], // Adicionar CommonModule às importações
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'] // Corrigir typo: de 'styleUrl' para 'styleUrls'
})
export class HomeComponent implements OnInit {
  role: string = '';
  nome: string = '';


  ngOnInit() {
    // Verificar se está executando no navegador
    if (typeof localStorage !== 'undefined') {
      this.role = localStorage.getItem('role') || 'funcionário';
      this.nome = localStorage.getItem('nome') || 'Usuário';
      this.nome = this.nome.split(' ')[0];
    } else {
      // Definir um valor padrão ou realizar alguma ação alternativa se não estiver no navegador
      this.role = 'funcionário';
    }
  }
}
