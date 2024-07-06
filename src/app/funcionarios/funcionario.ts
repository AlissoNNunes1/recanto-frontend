// src/app/funcionarios/funcionario.ts

export interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  funcao: string;
  turno: string;
  telefone: string;
  email: string;
  UsuarioId: number;
}

export interface FuncionarioCreate {
  nome: string;
  cpf: string;
  funcao: string;
  turno: string;
  telefone: string;
  email: string;
  UsuarioId: number;
}

export interface FuncionarioUpdate {
  nome: string;
  cpf: string;
  funcao: string;
  turno: string;
  telefone: string;
  email: string;
}

export interface Message {
  message: string;
}

