
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
  ANTHALMATICS = 'Anthalmatics',
  VACCINE = 'Vaccine',
  NOTE = 'Note'
}

// New interface for detailed diagnosis information
export interface DiagnosisDetails {
  field: string;               // General diagnosis description
  laboratory: string;          // Lab findings
  virologicalTest: string;     // Virology results
  serologicalTest: string;      // Serology results
  postMortemFindings: string;  // Necropsy observations
}

// New interface for vaccine specific details
export interface VaccineDetails {
  name: string;
  route: string;
  duration: string;
  boosterDose: string;
}

export interface TreatmentItem {
  id: string;
  type: TreatmentType;
  name: string;      // Used for Drug Name or Vaccine Name
  dose?: string;     // Medicine, Drug, Anthalmatics
  route?: string;    // All except Note
  frequency?: string;// Medicine, Drug, Anthalmatics
  duration?: string; // Medicine, Drug, Anthalmatics, Vaccine
  boosterDose?: string; // Vaccine only
  notes?: string;    // Used as the single field for "Note" type
}

export interface HostEntry {
  animalName: string;
  cause: string;
  clinicalSigns: string;
  diagnosisDetails?: DiagnosisDetails;
  treatments: TreatmentItem[];
  prevention: string;
  precaution: string;
  epidemiology: string;
  customFields?: Record<string, string>;
  images?: { url: string; caption: string }[];
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
