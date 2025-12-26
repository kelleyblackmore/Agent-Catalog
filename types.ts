import { LucideIcon } from 'lucide-react';

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  systemInstruction: string;
  category: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}