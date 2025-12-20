import * as XLSX from 'xlsx';
import { Disease, HostEntry, TreatmentItem } from '../types';

interface FlatDiseaseRow {
    DiseaseID: string;
    DiseaseName: string;
    CausalAgent: string;
    CreatedAt: string; // ISO String
    SearchCount: number;

    // Host Specifics
    HostAnimal: string;
    HostCause: string;
    HostClinicalSigns: string;
    HostDiagnosis: string;
    HostPrevention: string;
    HostPrecaution: string;
    HostEpidemiology: string;

    // Complex fields stringified
    HostTreatmentsJSON: string;
    HostCustomFieldsJSON: string;
}

export const exportDiseases = (diseases: Disease[], type: 'xlsx' | 'csv' = 'xlsx') => {
    const flatData: FlatDiseaseRow[] = [];

    diseases.forEach(d => {
        if (d.hosts.length === 0) {
            // Export disease even if no hosts, with empty host fields
            flatData.push({
                DiseaseID: d.id,
                DiseaseName: d.name,
                CausalAgent: d.causalAgent,
                CreatedAt: new Date(d.createdAt).toISOString(),
                SearchCount: d.searchCount,
                HostAnimal: '',
                HostCause: '',
                HostClinicalSigns: '',
                HostDiagnosis: '',
                HostPrevention: '',
                HostPrecaution: '',
                HostEpidemiology: '',
                HostTreatmentsJSON: '[]',
                HostCustomFieldsJSON: '{}'
            });
        } else {
            d.hosts.forEach(h => {
                flatData.push({
                    DiseaseID: d.id,
                    DiseaseName: d.name,
                    CausalAgent: d.causalAgent,
                    CreatedAt: new Date(d.createdAt).toISOString(),
                    SearchCount: d.searchCount,
                    HostAnimal: h.animalName,
                    HostCause: h.cause,
                    HostClinicalSigns: h.clinicalSigns,
                    HostDiagnosis: h.diagnosis,
                    HostPrevention: h.prevention,
                    HostPrecaution: h.precaution,
                    HostEpidemiology: h.epidemiology,
                    HostTreatmentsJSON: JSON.stringify(h.treatments),
                    HostCustomFieldsJSON: JSON.stringify(h.customFields || {})
                });
            });
        }
    });

    const worksheet = XLSX.utils.json_to_sheet(flatData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Diseases");

    const fileName = `VetPath_Registry_${new Date().toISOString().slice(0, 10)}`;
    if (type === 'xlsx') {
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } else {
        XLSX.writeFile(workbook, `${fileName}.csv`);
    }
};

export const parseImportFile = async (file: File): Promise<Disease[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json<FlatDiseaseRow>(worksheet);

                const diseaseMap = new Map<string, Disease>();

                jsonData.forEach(row => {
                    const id = row.DiseaseID || Date.now().toString() + Math.random().toString(); // Fallback ID if missing

                    if (!diseaseMap.has(id)) {
                        diseaseMap.set(id, {
                            id: id,
                            name: row.DiseaseName || 'Unknown Disease',
                            causalAgent: row.CausalAgent || 'Unknown Agent',
                            createdAt: row.CreatedAt ? new Date(row.CreatedAt).getTime() : Date.now(),
                            searchCount: Number(row.SearchCount) || 0,
                            hosts: []
                        });
                    }

                    if (row.HostAnimal) {
                        const disease = diseaseMap.get(id)!;

                        // Try parse JSON fields, fallback to empty/defaults
                        let treatments: TreatmentItem[] = [];
                        try {
                            if (row.HostTreatmentsJSON) treatments = JSON.parse(row.HostTreatmentsJSON);
                        } catch (e) {
                            console.warn(`Failed to parse treatments for ${row.DiseaseName}`, e);
                        }

                        let customFields: Record<string, string> = {};
                        try {
                            if (row.HostCustomFieldsJSON) customFields = JSON.parse(row.HostCustomFieldsJSON);
                        } catch (e) {
                            console.warn(`Failed to parse custom fields for ${row.DiseaseName}`, e);
                        }

                        const hostEntry: HostEntry = {
                            animalName: row.HostAnimal,
                            cause: row.HostCause || '',
                            clinicalSigns: row.HostClinicalSigns || '',
                            diagnosis: row.HostDiagnosis || '',
                            prevention: row.HostPrevention || '',
                            precaution: row.HostPrecaution || '',
                            epidemiology: row.HostEpidemiology || '',
                            treatments: treatments,
                            customFields: customFields
                        };

                        // Avoid duplicate hosts for same animal if row repeated erroneously
                        if (!disease.hosts.some(h => h.animalName === hostEntry.animalName)) {
                            disease.hosts.push(hostEntry);
                        }
                    }
                });

                resolve(Array.from(diseaseMap.values()));
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};
