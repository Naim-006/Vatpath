
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function suggestDiseaseDetails(diseaseName: string, animalName: string) {
  try {
    // Using gemini-3-pro-preview for complex veterinary medicine reasoning and STEM tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Provide detailed veterinary medical information for the disease "${diseaseName}" in "${animalName}". Focus on evidence-based DVM protocols.`,
      config: {
        systemInstruction: "You are a world-class veterinary medicine expert. Provide accurate, technical, and structured information for DVMs. Return valid JSON only.",
        responseMimeType: "application/json",
        // Adding thinking budget for improved medical reasoning in a complex task
        thinkingConfig: { thinkingBudget: 32768 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            causalAgent: { type: Type.STRING },
            cause: { type: Type.STRING },
            clinicalSigns: { type: Type.STRING },
            diagnosis: { type: Type.STRING },
            treatment: {
              type: Type.OBJECT,
              properties: {
                medicine: { type: Type.STRING },
                drug: { type: Type.STRING },
                vaccine: { type: Type.STRING }
              },
              required: ["medicine", "drug", "vaccine"]
            },
            prevention: { type: Type.STRING },
            precaution: { type: Type.STRING },
            epidemiology: { type: Type.STRING }
          },
          required: ["causalAgent", "cause", "clinicalSigns", "diagnosis", "treatment", "prevention", "precaution", "epidemiology"]
        }
      }
    });

    // Directly access the text property as per @google/genai guidelines
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}
