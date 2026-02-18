
import React, { useRef } from 'react';
import { Framework, ResourceType, FiveMFile } from '../types';

interface SidebarProps {
  framework: Framework;
  setFramework: (f: Framework) => void;
  type: ResourceType;
  setType: (t: ResourceType) => void;
  prompt: string;
  setPrompt: (p: string) => void;
  onGenerate: () => void;
  onImport: (files: FiveMFile[]) => void;
  onOpenTemplates: () => void;
  onReset: () => void;
  loading: boolean;
  hasExistingFiles: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  framework,
  setFramework,
  type,
  setType,
  prompt,
  setPrompt,
  onGenerate,
  onImport,
  onOpenTemplates,
  onReset,
  loading,
  hasExistingFiles
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const importedFiles: FiveMFile[] = [];
    const validExtensions = ['.lua', '.js', '.html', '.css', '.sql', '.json'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const name = file.name;
      const extension = name.substring(name.lastIndexOf('.')).toLowerCase();
      
      if (validExtensions.includes(extension) || name === 'fxmanifest.lua' || name === '__resource.lua') {
        const content = await file.text();
        const languageMap: Record<string, FiveMFile['language']> = {
          '.lua': 'lua',
          '.js': 'javascript',
          '.html': 'html',
          '.css': 'css',
          '.sql': 'sql',
          '.json': 'json'
        };
        
        importedFiles.push({
          path: (file as any).webkitRelativePath || name,
          name,
          content,
          language: languageMap[extension] || 'lua'
        });
      }
    }

    if (importedFiles.length > 0) {
      onImport(importedFiles);
    } else {
      alert("Nenhum arquivo válido de FiveM encontrado.");
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
            F5
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Forge AI
          </h1>
        </div>
        <button 
          onClick={onReset}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-400 transition-all"
          title="Novo Projeto (Limpar)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        <button
          onClick={onOpenTemplates}
          className="w-full bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Templates de Base
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 py-2.5 px-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Importar Pasta Local
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
        />
      </div>

      <div className="space-y-4">
        {hasExistingFiles && (
          <button
            onClick={onGenerate}
            disabled={loading}
            className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/5 animate-pulse"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Auditar Base Importada
          </button>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Framework Alvo</label>
          <select 
            value={framework}
            onChange={(e) => setFramework(e.target.value as Framework)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            {Object.values(Framework).map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tipo de Script</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value as ResourceType)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            {Object.values(ResourceType).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Instruções de Geração</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={hasExistingFiles ? "O que devemos mudar ou adicionar nesta base?" : "Descreva o que deseja criar do zero..."}
            className="w-full h-40 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all placeholder:text-slate-600"
          />
        </div>

        <button
          onClick={onGenerate}
          disabled={loading || (!prompt.trim() && !hasExistingFiles)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              {hasExistingFiles ? (prompt.trim() ? 'Atualizar com Instruções' : 'Analisar Estrutura') : 'Criar Base do Zero'}
            </>
          )}
        </button>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">
          Forge AI v2.5 • Auditor Pro
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
