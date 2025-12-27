import { HostEntry, TreatmentType } from '../types';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface AIResearchResult {
    hostEntry: HostEntry;
    causalAgent: string;
}

export const generateDiseaseContent = async (
    diseaseName: string,
    animalName: string
): Promise<AIResearchResult> => {
    if (!API_KEY) {
        throw new Error('Missing Groq API Key. Please check .env configuration.');
    }

    const prompt = `
  Acting as a professional veterinary specialist, provide a comprehensive monograph for the animal disease "${diseaseName}" specifically for the host species "${animalName}".
  
  Return ONLY valid JSON. Use the exact following structure:
  {
    "causalAgent": "Name of agent (e.g. Virus, Bacteria name)",
    "cause": "Detailed etiology under <h3>Description</h3> and <p> content.",
    "clinicalSigns": "Detailed clinical signs formatted with HTML (<ul>, <li>, <p>).",
    "diagnosisDetails": {
      "field": "Field diagnosis methods (HTML allowed)",
      "laboratory": "Lab confirmation methods (HTML allowed)",
      "virologicalTest": "Specific virology tests if applicable (HTML allowed)",
      "serologicalTest": "Serology details if applicable (HTML allowed)",
      "postMortemFindings": "Necropsy findings (HTML allowed)"
    },
    "treatments": [
      {
        "type": "Medicine or Vaccine", 
        "name": "Drug Name", 
        "dose": "Dosage (e.g. 5mg/kg)", 
        "route": "Route (e.g. IM/SC/PO)", 
        "frequency": "Frequency (e.g. BID or Once)", 
        "duration": "Duration (e.g. 5 days)", 
        "boosterDose": "Booster timing if Vaccine (e.g. 6 months)",
        "notes": "Important instructions"
      }
    ],
    "prevention": "Prevention strategies (HTML)",
    "precaution": "Safety precautions (HTML)",
    "epidemiology": "Epidemiological context (HTML)"
  }
  
  Safety Rules:
  - Do not include markdown code block syntax (like \`\`\`json).
  - Use HTML for internal string formatting (e.g. <strong>, <ul>).
  - Provide evidence-based veterinary information.
  - For treatments, list at least 2-3 standard clinical agents (e.g. Specific antibiotics, supportives, or vaccines).
  `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: "You are a veterinary research assistant. Output strictly valid JSON without markdown wrapping." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.1, // Set low for consistent JSON
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Groq API call failed');
        }

        const data = await response.json();
        const contentText = data.choices?.[0]?.message?.content;

        if (!contentText) {
            throw new Error('Empty response from AI');
        }

        const result = JSON.parse(contentText);

        // Map to HostEntry type
        const hostEntry: HostEntry = {
            animalName: animalName,
            cause: result.cause || '',
            clinicalSigns: result.clinicalSigns || '',
            diagnosisDetails: {
                field: result.diagnosisDetails?.field || '',
                laboratory: result.diagnosisDetails?.laboratory || '',
                virologicalTest: result.diagnosisDetails?.virologicalTest || '',
                serologicalTest: result.diagnosisDetails?.serologicalTest || '',
                postMortemFindings: result.diagnosisDetails?.postMortemFindings || '',
            },
            treatments: (result.treatments || []).map((t: any) => ({
                id: Date.now().toString() + Math.random(),
                type: t.type?.toLowerCase().includes('vaccine') ? TreatmentType.VACCINE : TreatmentType.MEDICINE,
                name: t.name || '',
                dose: t.dose || '',
                route: t.route || '',
                frequency: t.frequency || '',
                duration: t.duration || '',
                boosterDose: t.boosterDose || '',
                notes: t.notes || ''
            })),
            prevention: result.prevention || '',
            precaution: result.precaution || '',
            epidemiology: result.epidemiology || '',
            customFields: {},
            images: []
        };

        return {
            hostEntry,
            causalAgent: result.causalAgent || ''
        };

    } catch (error: any) {
        console.error("Groq Research Error:", error);
        throw new Error(error.message || 'AI Research failed');
    }
};
