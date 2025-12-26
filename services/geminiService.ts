import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { Agent } from '../types';

// Initialize the API client
// We assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Creates a new chat session specialized for the selected agent.
 * @param agent The agent configuration
 * @param history Optional previous chat history to restore context
 */
export const createAgentChat = (agent: Agent, history?: Content[]): Chat => {
  return ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: agent.systemInstruction,
      temperature: 0.5, // Lower temperature to strictly adhere to role constraints
    },
    history: history,
  });
};

/**
 * Sends a message to the chat session and yields chunks of the response.
 */
export async function* sendMessageStream(
  chat: Chat,
  message: string
): AsyncGenerator<string, void, unknown> {
  try {
    const resultStream = await chat.sendMessageStream({ message });
    
    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Error in sendMessageStream:", error);
    throw error;
  }
}