
import React from 'react';
import { RepoTemplate, Framework } from '../types';

const OFFICIAL_TEMPLATES: RepoTemplate[] = [
  {
    id: 'qbcore',
    name: 'QBCore Framework (Core)',
    owner: 'qbcore-framework',
    repo: 'qb-core',
    framework: Framework.QBCORE,
    description: 'A base oficial do framework QBCore, otimizada e pronta para expansão.'
  },
  {
    id: 'esx-legacy',
    name: 'ESX Legacy (Core)',
    owner: 'esx-framework',
    repo: 'esx_core',
    framework: Framework.ESX,
    description: 'O framework mais popular para servidores de Roleplay clássicos.'
  },
  {
    id: 'vrp-basic',
    name: 'vRP 1.0 (Basic)',
    owner: 'vRP-framework',
    repo: 'vRP',
    framework: Framework.VRP,
    description: 'Framework modular vRP original para servidores focados em desempenho.'
  }
];

interface TemplateGalleryProps {
  onSelect: (template: RepoTemplate) => void;
  onClose: () => void;
  isLoading: boolean;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelect, onClose, isLoading }) => {
  const handleDownloadZip = (template: RepoTemplate) => {
    const url = `https://github.com/${template.owner}/${template.repo}/archive/refs/heads/main.zip`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Templates e Repositórios</h2>
            <p className="text-slate-400 text-sm">Baixe a base oficial ou importe para editar com nossa IA.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {OFFICIAL_TEMPLATES.map((template) => (
            <div 
              key={template.id}
              className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all flex flex-col h-full shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                  {template.framework}
                </span>
                <div className="flex gap-2 text-slate-500">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.381 1.235-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                   </svg>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
              <p className="text-sm text-slate-400 mb-6 flex-1 leading-relaxed">{template.description}</p>
              
              <div className="grid grid-cols-2 gap-3 mt-auto">
                <button 
                  disabled={isLoading}
                  onClick={() => handleDownloadZip(template)}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-600 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Baixar ZIP
                </button>
                <button 
                  disabled={isLoading}
                  onClick={() => onSelect(template)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Importar
                </button>
              </div>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white font-bold text-lg">Preparando Arquivos...</p>
              <p className="text-slate-500 text-sm mt-1">Conectando ao repositório oficial</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateGallery;
