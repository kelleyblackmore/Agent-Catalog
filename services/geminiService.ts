import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { Agent } from '../types';

// Initialize the API client
// We assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const DEFAULT_MODEL = 'gemini-3-flash-preview';

/**
 * Creates a new chat session specialized for the selected agent.
 * @param agent The agent configuration
 * @param history Optional previous chat history to restore context
 */
export const createAgentChat = (agent: Agent, history?: Content[]): Chat => {
  return ai.chats.create({
    model: agent.model || DEFAULT_MODEL,
    config: {
      systemInstruction: agent.systemInstruction,
      temperature: 0.5, // Lower temperature to strictly adhere to role constraints
    },
    history: history,
  });
};

/**
 * Sends a message to the chat session and yields chunks of the response.
 * Yields an object containing text and optionally an image (base64 data URI).
 */
export async function* sendMessageStream(
  chat: Chat,
  message: string
): AsyncGenerator<{ text: string; image?: string }, void, unknown> {
  try {
    const resultStream = await chat.sendMessageStream({ message });
    
    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      let text = '';
      let image: string | undefined;

      if (c.text) {
        text = c.text;
      }
      
      // Check for images in the response parts
      const parts = c.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            // Construct the data URI for the image
            image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
      
      yield { text, image };
    }
  } catch (error) {
    console.error("Error in sendMessageStream:", error);
    throw error;
  }
}