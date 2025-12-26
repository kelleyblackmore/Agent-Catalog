import React from 'react';
import { Agent } from '../types';
import { ArrowRight } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect }) => {
  const Icon = agent.icon;

  return (
    <div 
      onClick={() => onSelect(agent)}
      className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 ${agent.bgColor} rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110 opacity-50`}></div>
      
      <div>
        <div className={`w-14 h-14 rounded-xl ${agent.bgColor} ${agent.color} flex items-center justify-center mb-4 shadow-sm`}>
          <Icon size={28} strokeWidth={2} />
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
          {agent.name}
        </h3>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          {agent.role}
        </p>
        <p className="text-slate-600 text-sm leading-relaxed">
          {agent.description}
        </p>
      </div>

      <div className="mt-6 flex items-center text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
        Start Chat <ArrowRight size={16} className="ml-1" />
      </div>
    </div>
  );
};

export default AgentCard;