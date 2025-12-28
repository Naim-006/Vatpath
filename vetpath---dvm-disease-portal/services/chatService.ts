
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export const sendMessageToGroq = async (messages: Message[]): Promise<string> => {
    if (!API_KEY) {
        throw new Error('Missing Groq API Key. Please check .env configuration.');
    }

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
                    {
                        role: "system",
                        content: "You are a helpful veterinary assistant integrated into the Vatpath Disease Portal admin panel. Help the administrator with disease research, treatment protocols, and general veterinary questions. Keep responses concise and professional."
                    },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 1024,
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

        return contentText;

    } catch (error: any) {
        console.error("Groq Chat Error:", error);
        throw new Error(error.message || 'AI Chat failed');
    }
};
