
import React, { useState } from 'react';
import { FiveMFile } from '../types';

interface CodeViewerProps {
  files: FiveMFile[];
  structure: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ files, structure }) => {
  const [selectedFile, setSelectedFile] = useState<FiveMFile | null>(files[0] || null);
  const [showStructure, setShowStructure] = useState(true);

  if (files.length === 0) return null;

  const handleDownloadFile = (file: FiveMFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col md:flex-row overflow-hidden bg-slate-950">
      {/* File Explorer */}
      <div className="w-full md:w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Explorador</span>
          <button 
            onClick={() => setShowStructure(!showStructure)}
            className="text-slate-400 hover:text-indigo-400 text-[10px] font-bold uppercase transition-colors"
          >
            {showStructure ? 'Ocultar Árvore' : 'Ver Árvore'}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {showStructure && (
            <div className="p-4 bg-slate-950/50 border-b border-slate-800">
              <pre className="text-[11px] text-indigo-400/80 font-mono leading-tight whitespace-pre">
                {structure}
              </pre>
            </div>
          )}
          
          <div className="py-2">
            {files.map((file, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-all relative group ${
                  selectedFile?.path === file.path 
                    ? 'bg-indigo-600/10 text-indigo-400 border-r-2 border-indigo-500' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className="flex-shrink-0 w-8 flex justify-center">
                  <FileIcon language={file.language} />
                </div>
                <span className="truncate flex-1 font-medium">{file.name}</span>
                
                <div 
                   onClick={(e) => { e.stopPropagation(); handleDownloadFile(file); }}
                   className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-all"
                   title="Baixar este arquivo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden">
        {selectedFile ? (
          <>
            <div className="h-12 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center px-6 justify-between">
              <div className="flex items-center gap-3">
                <FileIcon language={selectedFile.language} />
                <span className="text-xs font-bold text-slate-300 font-mono">{selectedFile.path}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(selectedFile.content);
                    // Feedback simples aqui seria ideal
                  }}
                  className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md transition-all border border-slate-700"
                >
                  Copiar
                </button>
                <button 
                  onClick={() => handleDownloadFile(selectedFile)}
                  className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 px-3 py-1.5 rounded-md transition-all border border-indigo-500/30"
                >
                  Baixar
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6 code-font text-sm leading-relaxed custom-scrollbar">
              <pre className="text-slate-300 whitespace-pre">
                {selectedFile.content}
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-700 gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="italic font-medium">Selecione um arquivo para ver o código</span>
          </div>
        )}
      </div>
    </div>
  );
};

const FileIcon = ({ language }: { language: string }) => {
  switch (language) {
    case 'lua': return <span className="text-blue-400 text-[10px] font-black border border-blue-400/30 px-1 rounded bg-blue-400/10">LUA</span>;
    case 'javascript': return <span className="text-yellow-400 text-[10px] font-black border border-yellow-400/30 px-1 rounded bg-yellow-400/10">JS</span>;
    case 'html': return <span className="text-orange-400 text-[10px] font-black border border-orange-400/30 px-1 rounded bg-orange-400/10">HTML</span>;
    case 'css': return <span className="text-indigo-400 text-[10px] font-black border border-indigo-400/30 px-1 rounded bg-indigo-400/10">CSS</span>;
    case 'sql': return <span className="text-green-400 text-[10px] font-black border border-green-400/30 px-1 rounded bg-green-400/10">SQL</span>;
    default: return <span className="text-slate-400 text-xs">📄</span>;
  }
};

export default CodeViewer;
