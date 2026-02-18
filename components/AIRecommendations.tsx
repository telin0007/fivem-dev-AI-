
import React from 'react';
import { Recommendation } from '../types';

interface AIRecommendationsProps {
  recommendations: Recommendation[];
  onApply: (rec: Recommendation) => void;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ recommendations, onApply }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="bg-slate-900 border-l border-slate-800 w-80 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auditoria da IA</span>
        </div>
        <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded border border-amber-500/20 font-bold">
          {recommendations.length} Alertas
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <p className="text-[11px] text-slate-500 leading-relaxed italic">
          Analisamos sua base e identificamos componentes essenciais que podem estar faltando para um funcionamento estável:
        </p>

        {recommendations.map((rec, idx) => (
          <div 
            key={idx} 
            className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-indigo-500/50 transition-all group relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${
              rec.priority === 'High' ? 'bg-red-500' : rec.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
            }`}></div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black uppercase text-indigo-400 tracking-tighter bg-indigo-500/10 px-1.5 py-0.5 rounded">
                {rec.category}
              </span>
              <span className={`text-[9px] font-bold ${
                rec.priority === 'High' ? 'text-red-400' : 'text-slate-500'
              }`}>
                {rec.priority === 'High' ? 'Crítico' : rec.priority}
              </span>
            </div>

            <h4 className="text-xs font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{rec.title}</h4>
            <p className="text-[10px] text-slate-500 leading-normal mb-3">{rec.description}</p>
            
            <button 
              onClick={() => onApply(rec)}
              className="w-full py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold transition-all border border-slate-700 hover:border-indigo-500"
            >
              Pedir para criar agora
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-950/50 border-t border-slate-800">
        <div className="p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/10">
          <p className="text-[9px] text-indigo-300/70 leading-relaxed">
            Dica: Clique em "Pedir para criar" para que a IA gere automaticamente o plugin sugerido integrando-o à sua base atual.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;
