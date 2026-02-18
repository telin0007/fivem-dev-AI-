
import { GoogleGenAI, Type } from "@google/genai";
import { Framework, ResourceType, GeneratedResource, FiveMFile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const GENERATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    structure: { type: Type.STRING, description: "A markdown-style folder tree structure" },
    files: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          path: { type: Type.STRING },
          name: { type: Type.STRING },
          content: { type: Type.STRING },
          language: { type: Type.STRING },
        },
        required: ["path", "name", "content", "language"],
      },
    },
    instructions: { type: Type.STRING },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: { type: Type.STRING, description: "High, Medium, or Low" },
          category: { type: Type.STRING }
        },
        required: ["title", "description", "priority", "category"]
      }
    }
  },
  required: ["name", "description", "structure", "files", "instructions", "recommendations"],
};

export const generateFiveMResource = async (
  prompt: string,
  framework: Framework,
  type: ResourceType,
  existingFiles?: FiveMFile[]
): Promise<GeneratedResource> => {
  const context = existingFiles && existingFiles.length > 0 
    ? `\n\nEXISTING CODE CONTEXT (ANALYSIS REQUIRED):\nThe user has provided an existing server base/resource. Analyze these files to see what is already implemented.\n\n${existingFiles.map(f => `FILE: ${f.path}\nCONTENT:\n${f.content.substring(0, 1000)}...`).join('\n\n---\n\n')}`
    : '';

  const systemInstruction = `
    You are an advanced FiveM Server Auditor and Architect AI.
    Your goal is to ensure a FiveM server base is complete and production-ready.
    
    Rules for Code Generation:
    - Use clean Lua following best practices for ${framework}.
    - Ensure all events and exports are correct for the framework.
    
    Rules for Server Audit:
    - Analyze the provided context. If essential components for a functional ${framework} server are missing (e.g. Identity, Multicharacter, Banking, Inventory, Fuel, Garages, Admin Menu, Dispatch), list them in the 'recommendations' field.
    - Be specific about WHY they are needed for ${framework}.
    - If the user is creating a base from zero, provide a comprehensive list of what they will need to add next.
    
    Return a valid JSON object.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Task: Create/Modify a ${type} and Audit the Base. User Requirements: ${prompt}${context}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: GENERATION_SCHEMA,
      thinkingConfig: { thinkingBudget: 16000 }
    },
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response.text) as GeneratedResource;
};
