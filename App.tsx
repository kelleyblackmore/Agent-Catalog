import React, { useState } from 'react';
import { Agent } from './types';
import { AGENTS } from './constants';
import AgentCard from './components/AgentCard';
import ChatInterface from './components/ChatInterface';
import { Bot, Sparkles, ChevronDown, ChevronRight, Layers } from 'lucide-react';

const App: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handleBack = () => {
    setSelectedAgent(null);
  };

  // Group agents by category
  const groupedAgents = AGENTS.reduce((acc, agent) => {
    if (!acc[agent.category]) {
      acc[agent.category] = [];
    }
    acc[agent.category].push(agent);
    return acc;
  }, {} as Record<string, Agent[]>);

  // Define category order
  const categoryOrder = [
    'Productivity & Tech',
    'Creative & Entertainment',
    'Knowledge & Wisdom',
    'Lifestyle & Wellness'
  ];

  if (selectedAgent) {
    // We use the agent.id as a key to force the component to remount when the agent changes.
    // This ensures that the state (and chat history) is correctly initialized for the specific agent.
    return <ChatInterface key={selectedAgent.id} agent={selectedAgent} onBack={handleBack} />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-y-auto custom-scrollbar">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200 pt-16 pb-12 px-6 shadow-sm flex-shrink-0">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-50 rounded-2xl mb-6 ring-1 ring-indigo-100">
            <div className="bg-indigo-600 p-2 rounded-xl text-white mr-3 shadow-md">
              <Bot size={24} />
            </div>
            <span className="text-indigo-900 font-bold text-lg pr-2">PersonaAI Showcase</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Who do you want to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              talk to today?
            </span>
          </h1>
          
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Experience the power of Google Gemini through specialized personas. 
            From managing projects to exploring fantasy worlds, select an agent to start a conversation.
          </p>
        </div>
      </div>

      {/* Catalog Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="flex items-center mb-8">
           <Layers className="text-indigo-500 mr-2" size={20} />
           <h2 className="text-xl font-bold text-slate-800">Explore Categories</h2>
           <span className="ml-3 px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-bold rounded-full">
             {AGENTS.length} Agents
           </span>
        </div>

        <div className="space-y-8">
          {categoryOrder.map((category) => {
             const agents = groupedAgents[category];
             if (!agents) return null;
             
             return (
               <CategorySection 
                 key={category} 
                 title={category} 
                 agents={agents} 
                 onSelect={handleAgentSelect} 
               />
             );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-8 text-center mt-12 flex-shrink-0">
        <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
          Powered by Gemini API
        </p>
      </footer>
    </div>
  );
};

const CategorySection: React.FC<{ 
  title: string; 
  agents: Agent[]; 
  onSelect: (agent: Agent) => void 
}> = ({ title, agents, onSelect }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <span className="ml-3 px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-bold rounded-full">
            {agents.length}
          </span>
        </div>
        <div className="text-slate-400">
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>
      
      {isOpen && (
        <div className="p-6 pt-2 bg-white animate-in slide-in-from-top-2 duration-200">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
                onSelect={onSelect} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;