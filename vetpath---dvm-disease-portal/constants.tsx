
import { Disease, AnimalType, TreatmentType } from './types';

export const INITIAL_DISEASES: Disease[] = [
  {
    id: '1',
    name: 'Foot and Mouth Disease',
    causalAgent: 'Aphthovirus of the family Picornaviridae',
    createdAt: Date.now() - 1000000,
    searchCount: 150,
    hosts: [
      {
        animalName: AnimalType.BOVINE,
        cause: 'Direct or indirect contact with infected animals or contaminated environments.',
        clinicalSigns: 'Fever, blisters in the mouth and on feet, excessive salivation, lameness.',
        diagnosisDetails: {
          field: 'Clinical inspection, ELISA for antigen detection, PCR.',
          laboratory: 'Virus isolation in cell culture or suckling mice.',
          virologicalTest: 'RT-PCR to identify serotype.',
          serologicalTest: 'NSP ELISA to distinguish infected from vaccinated.',
          postMortemFindings: 'Vesicles on tongue, snout, and feet.'
        },
        treatments: [
          {
            id: 't1',
            type: TreatmentType.MEDICINE,
            name: 'Flunixin Meglumine',
            dose: '1.1 to 2.2 mg/kg',
            route: 'Intramuscular',
            frequency: 'Once daily',
            duration: '3-5 days',
            notes: 'Supportive care to manage fever and pain.'
          },
          {
            id: 't2',
            type: TreatmentType.VACCINE,
            name: 'Inactivated FMD Vaccine',
            route: 'Subcutaneous',
            duration: '6 months',
            boosterDose: 'At 6 months',
            notes: 'Essential for herd immunity.'
          },
          {
            id: 't3',
            type: TreatmentType.NOTE,
            name: 'General Note',
            notes: 'Ensure animals have access to fresh water at all times.'
          }
        ],
        prevention: 'Strict quarantine, movement controls, vaccination programs.',
        // Added missing precaution field to satisfy HostEntry interface
        precaution: 'Use protective clothing and disinfect equipment after contact with suspect animals.',
        epidemiology: 'Global distribution with endemic regions in Africa, Asia, and South America.'
      }
    ]
  },
  {
    id: '2',
    name: 'Rabies',
    causalAgent: 'Rabies virus (Lyssavirus)',
    createdAt: Date.now() - 5000000,
    searchCount: 320,
    hosts: [
      {
        animalName: AnimalType.CANINE,
        cause: 'Bite from an infected animal (saliva).',
        clinicalSigns: 'Behavioral changes, aggression, hydrophobia, paralysis, death.',
        diagnosisDetails: {
          field: 'Direct fluorescent antibody (DFA) test on brain tissue (post-mortem).',
          laboratory: 'RFFIT for neutralizing antibodies.',
          virologicalTest: 'RT-PCR on saliva or skin biopsy.',
          serologicalTest: 'Not typically used for clinical diagnosis in animals.',
          postMortemFindings: 'Negri bodies in hippocampus neurons.'
        },
        treatments: [],
        prevention: 'Mandatory vaccination of pets, wildlife baiting.',
        // Added missing precaution field to satisfy HostEntry interface
        precaution: 'Avoid direct contact with saliva or brain tissue of suspect animals; report all bites immediately.',
        epidemiology: 'Worldwide except for certain island nations like Australia and Japan.'
      }
    ]
  }
];

export const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Most Searched', value: 'most-searched' },
  { label: 'Alphabetical', value: 'alphabetical' }
];

export const ANIMAL_OPTIONS = Object.values(AnimalType);
