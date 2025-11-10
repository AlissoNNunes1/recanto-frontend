// Enums para medicamentos prescritos
// Devem estar sincronizados com o backend

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

// Labels amigaveis para os enums
export const VIAS_ADMINISTRACAO_LABELS = [
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

export const FREQUENCIAS_ADMINISTRACAO_LABELS = [
  { value: FrequenciaAdministracao.UMA_VEZ, label: 'Uma vez (Dose unica)' },
  { value: FrequenciaAdministracao.DIARIA, label: 'Diaria (1x ao dia)' },
  { value: FrequenciaAdministracao.BID, label: 'BID (2x ao dia / 12/12h)' },
  { value: FrequenciaAdministracao.TID, label: 'TID (3x ao dia / 8/8h)' },
  { value: FrequenciaAdministracao.QID, label: 'QID (4x ao dia / 6/6h)' },
  { value: FrequenciaAdministracao.SOS, label: 'SOS (Se necessario)' },
  { value: FrequenciaAdministracao.SEMANAL, label: 'Semanal (1x por semana)' },
  { value: FrequenciaAdministracao.MENSAL, label: 'Mensal (1x por mes)' },
  { value: FrequenciaAdministracao.OUTROS, label: 'Outras frequencias' },
];

// Funcoes helper para obter labels
export function getViaAdministracaoLabel(value: ViaAdministracao): string {
  const item = VIAS_ADMINISTRACAO_LABELS.find(v => v.value === value);
  return item ? item.label : value;
}

export function getFrequenciaAdministracaoLabel(value: FrequenciaAdministracao): string {
  const item = FREQUENCIAS_ADMINISTRACAO_LABELS.find(f => f.value === value);
  return item ? item.label : value;
}

/*
   __  ____ ____ _  _
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
