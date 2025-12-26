import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Agent, Message } from '../types';
import { createAgentChat, sendMessageStream } from '../services/geminiService';
import ChatMessage from './ChatMessage';
import { ArrowLeft, Send, RefreshCw } from 'lucide-react';
import { Chat } from '@google/genai';

interface ChatInterfaceProps {
  agent: Agent;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ agent, onBack }) => {
  const STORAGE_KEY = `chat_history_${agent.id}`;

  // Initialize state from local storage
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        // Parse and revive Date objects
        const parsed = JSON.parse(saved, (key, value) => 
          key === 'timestamp' ? new Date(value) : value
        );
        // Clean up any incomplete streaming states (empty text)
        return parsed.filter((m: Message) => m.text && m.text.trim() !== '');
      }
    } catch (e) {
      console.warn("Failed to parse chat history", e);
    }
    return [];
  });

  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  // We use a ref to persist the chat session across renders without triggering re-renders itself
  const chatSessionRef = useRef<Chat | null>(null);
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Save messages to local storage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      // Filter out empty 'Thinking...' messages before saving
      const messagesToSave = messages.filter(m => m.text && m.text.trim() !== '');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToSave));
    }
  }, [messages, STORAGE_KEY]);

  // Initialize Chat
  useEffect(() => {
    // Prepare history for the Gemini SDK
    // We strictly use the messages state which was initialized from localStorage
    const history = messages
      .filter(m => !m.isError && m.text)
      .map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

    chatSessionRef.current = createAgentChat(agent, history);
    
    // Focus input on mount
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent]); // Dependent on agent, but we don't want to re-run on messages change to avoid session reset

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming || !chatSessionRef.current) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    setIsStreaming(true);

    // Placeholder for Model Message
    const modelMsgId = (Date.now() + 1).toString();
    const initialModelMsg: Message = {
      id: modelMsgId,
      role: 'model',
      text: '', // Starts empty
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, initialModelMsg]);

    try {
      const stream = sendMessageStream(chatSessionRef.current, userText);
      let fullText = '';

      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === modelMsgId ? { ...msg, text: fullText } : msg
          )
        );
      }
    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === modelMsgId 
            ? { ...msg, text: "I'm having trouble connecting right now. Please try again.", isError: true } 
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    chatSessionRef.current = createAgentChat(agent);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center shadow-sm z-10 sticky top-0 flex-shrink-0">
        <button 
          onClick={onBack}
          className="mr-3 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          title="Back to Catalog"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className={`w-10 h-10 rounded-full ${agent.bgColor} ${agent.color} flex items-center justify-center mr-3`}>
          <agent.icon size={20} />
        </div>
        
        <div>
          <h2 className="font-bold text-slate-800 leading-tight">{agent.name}</h2>
          <p className="text-xs text-slate-500 font-medium">{agent.role}</p>
        </div>

        <div className="ml-auto">
             <button 
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              title="Reset Chat"
            >
              <RefreshCw size={18} />
            </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 container mx-auto max-w-4xl">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
            <div className={`w-20 h-20 rounded-2xl ${agent.bgColor} ${agent.color} flex items-center justify-center mb-6`}>
              <agent.icon size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Chat with {agent.name}</h3>
            <p className="text-slate-500 max-w-sm">
              {agent.description} <br/> Say hello to start the conversation!
            </p>
          </div>
        ) : (
          messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} agentColor={agent.color} />
          ))
        )}
        
        {isStreaming && messages.length > 0 && !messages[messages.length - 1].text && (
             <div className="flex items-center space-x-2 p-4 text-slate-400 text-sm animate-pulse">
                <div className={`w-2 h-2 rounded-full ${agent.bgColor}`}></div>
                <div className={`w-2 h-2 rounded-full ${agent.bgColor} delay-75`}></div>
                <div className={`w-2 h-2 rounded-full ${agent.bgColor} delay-150`}></div>
                <span>Thinking...</span>
             </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
        <div className="container mx-auto max-w-4xl relative">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agent.name}...`}
            disabled={isStreaming}
            rows={1}
            className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none text-slate-700 placeholder:text-slate-400 disabled:opacity-50 shadow-inner scrollbar-hide"
            style={{ minHeight: '56px', maxHeight: '150px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isStreaming}
            className={`absolute right-3 bottom-3 p-2 rounded-xl flex items-center justify-center transition-all duration-200
              ${inputValue.trim() && !isStreaming 
                ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:scale-105' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          AI agents can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;