import { GoogleGenAI, Modality } from "@google/genai";
import { MANDATORY_PROMPT, RoofMaterial } from "../types";

// Switched to the image generation/editing model
const MODEL_NAME = 'gemini-2.5-flash-image';

export const generateSketch = async (
  apiKey: string, 
  base64Image: string, 
  mimeType: string,
  material: RoofMaterial
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set it in Settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Append specific material instruction to the base prompt
  const specificPrompt = `${MANDATORY_PROMPT}\n\n**SELECTED MATERIAL:** ${material}. \nEnsure the texture strictly follows the visual characteristics of ${material}.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: specificPrompt
          }
        ]
      },
      config: {
        // Request an Image response instead of text
        responseModalities: [Modality.IMAGE],
      }
    });

    // Extract the generated image from the response
    const generatedPart = response.candidates?.[0]?.content?.parts?.[0];
    
    if (!generatedPart || !generatedPart.inlineData) {
        throw new Error("The model did not return an image. Please try again.");
    }

    const outputBase64 = generatedPart.inlineData.data;
    const outputMime = generatedPart.inlineData.mimeType || 'image/png';

    return `data:${outputMime};base64,${outputBase64}`;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('404') || error.message?.includes('not found')) {
        throw new Error(`Model ${MODEL_NAME} not found. Please ensure your API key has access to the image generation models.`);
    }
    throw new Error(error.message || "Failed to generate sketch.");
  }
};