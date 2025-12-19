
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
        diagnosis: 'Clinical inspection, ELISA for antigen detection, PCR.',
        treatments: [
          {
            id: 't1',
            type: TreatmentType.MEDICINE,
            name: 'Flunixin Meglumine',
            dose: '1.1 to 2.2 mg/kg',
            frequency: 'Once daily',
            duration: '3-5 days',
            notes: 'Supportive care to manage fever and pain.'
          },
          {
            id: 't2',
            type: TreatmentType.VACCINE,
            name: 'Inactivated FMD Vaccine',
            dose: '2ml',
            frequency: 'Every 6 months',
            duration: 'Continuous',
            notes: 'Essential for herd immunity in endemic areas.'
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
        diagnosis: 'Direct fluorescent antibody (DFA) test on brain tissue (post-mortem).',
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
