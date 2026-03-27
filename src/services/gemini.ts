import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getChatResponse = async (message: string, history: { role: "user" | "model", parts: { text: string }[] }[]) => {
  const model = "gemini-3-flash-preview";
  
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: `You are a helpful FAQ Chatbot for a generic platform. 
      Your goal is to answer user questions clearly and concisely.
      If you don't know the answer, politely suggest they contact support.
      Keep your tone professional yet friendly.
      Use markdown for formatting when appropriate (bold, lists, etc.).`,
    },
    history: history,
  });

  const result = await chat.sendMessage({ message });
  return result.text;
};
