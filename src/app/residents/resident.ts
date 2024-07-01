export interface Resident {
    id: number;
    nome: string;
    sexo: string;
    email: string;
    cpf: string;
    rg: string;
    contatoEmergencia: string;
    historicoMedico: string;
    foto: string;
    dataNascimento: string;
    user_id: number;
  }
  
  export interface ResidentCreate {
    nome: string;
    email: string;
    sexo: string;
    cpf: string;
    rg: string;
    contatoEmergencia: string;
    historicoMedico: string;
    foto: string;
    dataNascimento: string;
  }
  
  export interface ResidentUpdate {
    nome: string;
    email: string;
    sexo: string;
    cpf: string;
    rg: string;
    contatoEmergencia: string;
    historicoMedico: string;
    foto: string;
    dataNascimento: string;
  }
  
  export interface Message {
    message: string;
  }
  