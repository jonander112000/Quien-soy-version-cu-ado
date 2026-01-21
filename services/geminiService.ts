
import { GoogleGenAI, Type } from "@google/genai";
import { Character } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CHARACTER_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "Nombre completo del personaje español (ej: Rosalía, Cervantes, Rafa Nadal).",
    },
    category: {
      type: Type.STRING,
      description: "Categoría: Música, Deporte, Literatura, Historia, Cine, etc.",
    },
    hints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de 5 pistas graduadas de difícil a fácil.",
    },
    description: {
      type: Type.STRING,
      description: "Breve descripción biográfica de por qué es famoso.",
    },
    imageSearchQuery: {
      type: Type.STRING,
      description: "Una frase simple para buscar una imagen representativa en un buscador.",
    },
  },
  required: ["name", "category", "hints", "description", "imageSearchQuery"],
};

export const fetchNewCharacter = async (excludeList: string[] = []): Promise<Character> => {
  const excludePrompt = excludeList.length > 0 
    ? ` No elijas a ninguno de estos: ${excludeList.join(", ")}.`
    : "";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Genera un personaje famoso de la cultura española para el juego "¿Quién Soy?". El personaje debe ser ampliamente conocido en España y/o internacionalmente.${excludePrompt} Asegúrate de que las pistas sean divertidas y que la última pista sea bastante reveladora.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: CHARACTER_SCHEMA,
      systemInstruction: "Eres un experto en cultura española, cine, música, deportes e historia. Tu objetivo es crear desafíos entretenidos para un juego de adivinanzas.",
    },
  });

  const text = response.text || "{}";
  return JSON.parse(text) as Character;
};

export const validateGuess = async (guess: string, correctAnswer: string): Promise<boolean> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `¿Es "${guess}" una respuesta correcta o muy aproximada para el personaje "${correctAnswer}"? Responde solo con un booleano en formato JSON. Considera variaciones ortográficas menores o nombres incompletos conocidos.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN }
        },
        required: ["isCorrect"]
      }
    }
  });

  const result = JSON.parse(response.text || '{"isCorrect": false}');
  return result.isCorrect;
};
