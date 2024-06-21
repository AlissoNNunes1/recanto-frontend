export interface Resident {
    id: number;
    name: string;
    email: string;
    cpf: string;
    rg: string;
    emergency_contact: string;
    medical_history: string;
    photo: string;
    birth_date: string;
    user_id: number;
  }
  
  export interface ResidentCreate {
    name: string;
    email: string;
    cpf: string;
    rg: string;
    emergency_contact: string;
    medical_history: string;
    photo: string;
    birth_date: string;
  }
  
  export interface ResidentUpdate {
    name: string;
    email: string;
    cpf: string;
    rg: string;
    emergency_contact: string;
    medical_history: string;
    photo: string;
    birth_date: string;
  }
  
  export interface Message {
    message: string;
  }
  