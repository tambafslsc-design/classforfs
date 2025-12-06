import { GoogleGenAI } from "@google/genai";
import { LedgerAccount, Category } from "../types";

// Helper to get the API client. 
// Uses process.env.API_KEY as per instructions.
const getClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getExplanation = async (account: LedgerAccount, correctCategory: Category): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      You are an expert accounting tutor for HKDSE students.
      Explain briefly (in 1-2 sentences) why the ledger account "${account.name}" is classified under "${correctCategory}" 
      in the financial statements for the year ended 31 December 2025.
      
      If the account involves a date (e.g. Loan repayment), explicitly mention the reasoning based on the current date (31 Dec 2025).
      Keep it simple, encouraging, and clear.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No explanation available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Because ${account.name} is a standard item in ${correctCategory}. (AI Tutor unavailable)`;
  }
};
