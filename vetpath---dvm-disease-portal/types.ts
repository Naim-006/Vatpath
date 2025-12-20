
export enum AnimalType {
  BOVINE = 'Bovine (Cattle)',
  EQUINE = 'Equine (Horse)',
  CANINE = 'Canine (Dog)',
  FELINE = 'Feline (Cat)',
  OVINE = 'Ovine (Sheep)',
  CAPRINE = 'Caprine (Goat)',
  PORCINE = 'Porcine (Pig)',
  AVIAN = 'Avian (Bird)',
  AQUATIC = 'Aquatic',
  OTHER = 'Other'
}

export enum TreatmentType {
  MEDICINE = 'Medicine',
  DRUG = 'Drug',
  VACCINE = 'Vaccine',
  NEMATOMI = 'Nematomi'
}

export interface TreatmentItem {
  id: string;
  type: TreatmentType;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  notes: string;
}

export interface HostEntry {
  animalName: string;
  cause: string;
  clinicalSigns: string;
  diagnosis: string;
  treatments: TreatmentItem[];
  prevention: string;
  precaution: string;
  epidemiology: string;
  customFields?: Record<string, string>;
}

export interface Disease {
  id: string;
  name: string;
  causalAgent: string;
  createdAt: number;
  searchCount: number;
  hosts: HostEntry[];
}

export type SortOption = 'newest' | 'oldest' | 'most-searched' | 'alphabetical';

export type FontScale = 'normal' | 'large' | 'extra-large';

export interface User {
  id: string;
  username: string;
}
