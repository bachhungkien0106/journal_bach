import { GoogleGenAI, Type } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export interface AnalysisResult {
  insight: string;
  sentiment: 'joyful' | 'grateful' | 'peaceful' | 'resilient' | 'hopeful';
  tags: string[];
}

export const analyzeJournalEntry = async (items: string[]): Promise<AnalysisResult> => {
  try {
    const ai = getClient();
    const prompt = `
      The user has practiced the "Three Good Things" gratitude exercise.
      Here are their three things:
      1. ${items[0]}
      2. ${items[1]}
      3. ${items[2]}

      Analyze these entries.
      1. Provide a brief, warm, supportive, and specific psychological insight or affirmation (max 2 sentences) that reinforces their positive thinking.
      2. Identify the dominant positive emotion (sentiment) from this list: joyful, grateful, peaceful, resilient, hopeful.
      3. Extract 1-3 short thematic tags (e.g., "Family", "Nature", "Achievement").
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insight: { type: Type.STRING },
            sentiment: { 
              type: Type.STRING, 
              enum: ['joyful', 'grateful', 'peaceful', 'resilient', 'hopeful'] 
            },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["insight", "sentiment", "tags"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback if AI fails
    return {
      insight: "Taking time to reflect on the good creates a ripple effect of positivity in your life. Well done.",
      sentiment: 'peaceful',
      tags: ['Reflection']
    };
  }
};

export const generateWeeklyWisdom = async (): Promise<string> => {
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate a short, unique, inspiring quote or piece of wisdom about the power of gratitude and positive thinking. Do not use famous clichés.",
        });
        return response.text || "Gratitude turns what we have into enough.";
    } catch (e) {
        return "Gratitude turns what we have into enough.";
    }
}

export interface ReframeSuggestion {
    perspective: string;
    explanation: string;
}

export const getReframingSuggestions = async (challenge: string): Promise<ReframeSuggestion[]> => {
    try {
        const ai = getClient();
        const prompt = `
            The user is practicing Cognitive Reframing. 
            They are feeling challenged by this situation: "${challenge}".
            
            Provide exactly 3 distinct positive reframes (Perspectives):
            
            1. **Growth**: Focus on the learning opportunity, skill building, or resilience.
            2. **Curiosity**: Focus on replacing judgment or fear with wonder. (e.g., "I wonder why...", "What if...", "How might I...").
            3. **Optimism**: Focus on the silver lining, the bigger picture, or gratitude.
            
            Keep the explanations empathetic, practical, and short (1-2 sentences).
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            perspective: { type: Type.STRING, description: "A single word label for this perspective (e.g. 'Growth', 'Curiosity', 'Optimism')" },
                            explanation: { type: Type.STRING, description: "The reframed thought" }
                        },
                        required: ["perspective", "explanation"]
                    }
                }
            }
        });
        
        const text = response.text;
        if(!text) return [];
        return JSON.parse(text) as ReframeSuggestion[];

    } catch (error) {
        console.error("Reframing Error:", error);
        return [
            { perspective: "Growth", explanation: "This challenge is an opportunity to develop new skills and resilience." },
            { perspective: "Curiosity", explanation: "I wonder what new possibilities might open up if I let go of my expectations?" },
            { perspective: "Optimism", explanation: "In the grand scheme of things, this is a stepping stone, not a stumbling block." }
        ];
    }
}