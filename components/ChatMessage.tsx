import React, { useState } from 'react';
import { Message } from '../types';
import { User, Sparkles, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
  agentColor: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, agentColor }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} group relative`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 shadow-sm
          ${isUser ? 'bg-slate-800 text-white ml-3' : 'bg-white border border-slate-200 mr-3'}`}>
          {isUser ? <User size={16} /> : <Sparkles size={16} className={agentColor} />}
        </div>

        {/* Bubble */}
        <div 
          className={`
            relative p-4 rounded-2xl shadow-sm text-sm md:text-base
            ${isUser 
              ? 'bg-slate-800 text-white rounded-tr-none' 
              : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
            }
            ${message.isError ? 'border-red-300 bg-red-50 text-red-800' : ''}
          `}
        >
          {/* Generated Image */}
          {message.image && (
            <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
              <img 
                src={message.image} 
                alt="Generated content" 
                className="w-full h-auto object-cover" 
                loading="lazy"
              />
            </div>
          )}

          <div className="markdown-content pr-2">
            <ReactMarkdown>
              {message.text}
            </ReactMarkdown>
          </div>

          {/* Copy Button */}
          {!message.isError && (
             <button
              onClick={handleCopy}
              className={`
                absolute top-2 right-2 p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100
                ${isUser 
                  ? 'hover:bg-white/20 text-slate-300 hover:text-white' 
                  : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                }
              `}
              title="Copy to clipboard"
              aria-label="Copy to clipboard"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;