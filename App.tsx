
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Framework, ResourceType, GeneratedResource, GenerationState, FiveMFile, RepoTemplate, Recommendation } from './types';
import Sidebar from './components/Sidebar';
import CodeViewer from './components/CodeViewer';
import TemplateGallery from './components/TemplateGallery';
import AIRecommendations from './components/AIRecommendations';
import { generateFiveMResource } from './services/geminiService';
import { detectFrameworkFromFiles } from './services/frameworkDetector';
import JSZip from 'jszip';

const App: React.FC = () => {
  const [framework, setFramework] = useState<Framework>(Framework.QBCORE);
  const [type, setType] = useState<ResourceType>(ResourceType.PLUGIN);
  const [prompt, setPrompt] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [showAudit, setShowAudit] = useState(true);

  const [state, setState] = useState<GenerationState>({
    loading: false,
    error: null,
    result: null
  });

  const handleReset = useCallback(() => {
    if (confirm("Deseja realmente iniciar um novo projeto do zero? Todo o progresso atual será perdido.")) {
      setState({ loading: false, error: null, result: null });
      setPrompt('');
      setType(ResourceType.PLUGIN);
    }
  }, []);

  const handleStartFromScratch = useCallback(() => {
    setState({ loading: false, error: null, result: null });
    setPrompt('');
    setType(ResourceType.BASE); 
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) textarea.focus();
    }, 100);
  }, []);

  const handleGenerate = useCallback(async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt || "Analise esta base e me diga o que falta para ela ser um servidor profissional completo.";
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const existingFiles = state.result?.files;
      const result = await generateFiveMResource(finalPrompt, framework, type, existingFiles);
      setState({
        loading: false,
        error: null,
        result
      });
      if (!customPrompt) setPrompt(''); 
      setShowAudit(true); // Sempre mostra a auditoria após gerar/analisar
    } catch (err: any) {
      console.error(err);
      setState({
        loading: false,
        error: err.message || 'Erro inesperado na geração',
        result: state.result // Mantém o resultado anterior se houver erro
      });
    }
  }, [prompt, framework, type, state.result]);

  const handleApplyRecommendation = useCallback((rec: Recommendation) => {
    const recommendationPrompt = `Por favor, implemente o sistema de '${rec.title}' (${rec.category}). Contexto: ${rec.description}. Certifique-se de que o código gerado utilize os exports e eventos da minha base atual.`;
    handleGenerate(recommendationPrompt);
  }, [handleGenerate]);

  const handleImport = useCallback((files: FiveMFile[]) => {
    const detected = detectFrameworkFromFiles(files);
    if (detected) {
      setFramework(detected);
    }

    setState({
      loading: false,
      error: null,
      isImported: true,
      result: {
        name: files[0]?.path.split('/')[0] || "Imported Resource",
        description: `Base importada. Framework: ${detected || 'Desconhecido'}. Clique em 'Auditar Base' para iniciar a análise.`,
        structure: "Estrutura importada...",
        files: files,
        instructions: "Base carregada com sucesso. Recomenda-se clicar em 'Auditar Base' na barra lateral para que a IA analise o que falta no seu servidor.",
        recommendations: [] 
      }
    });
  }, []);

  const handleSelectTemplate = useCallback(async (template: RepoTemplate) => {
    setIsCloning(true);
    setFramework(template.framework);
    try {
      const filesToFetch = ['fxmanifest.lua', 'config.lua', 'server/main.lua', 'client/main.lua', 'server.lua', 'client.lua'];
      const fetchedFiles: FiveMFile[] = [];

      for (const path of filesToFetch) {
        try {
          const response = await fetch(`https://raw.githubusercontent.com/${template.owner}/${template.repo}/main/${path}`);
          if (response.ok) {
            const content = await response.text();
            fetchedFiles.push({
              path,
              name: path.split('/').pop() || path,
              content,
              language: 'lua'
            });
          }
        } catch (e) {
          try {
            const responseMaster = await fetch(`https://raw.githubusercontent.com/${template.owner}/${template.repo}/master/${path}`);
            if (responseMaster.ok) {
              const content = await responseMaster.text();
              fetchedFiles.push({
                path,
                name: path.split('/').pop() || path,
                content,
                language: 'lua'
              });
            }
          } catch (e2) {}
        }
      }

      if (fetchedFiles.length === 0) throw new Error("Não foi possível obter os arquivos do repositório.");

      setState({
        loading: false,
        error: null,
        isImported: true,
        result: {
          name: template.name,
          description: template.description,
          structure: `Repository: ${template.owner}/${template.repo}`,
          files: fetchedFiles,
          instructions: `Base ${template.name} carregada. Agora você pode pedir para a IA auditar ou adicionar sistemas específicos.`,
          recommendations: []
        }
      });
      setShowTemplates(false);
    } catch (err: any) {
      alert(`Erro ao clonar: ${err.message}`);
    } finally {
      setIsCloning(false);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!state.result) return;
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const folderName = state.result.name.toLowerCase().replace(/\s+/g, '_');
      const root = zip.folder(folderName);
      if (!root) throw new Error("Erro ao criar ZIP");
      state.result.files.forEach(file => {
        const cleanPath = file.path.startsWith('/') ? file.path.substring(1) : file.path;
        root.file(cleanPath, file.content);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${folderName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Erro ao gerar ZIP.");
    } finally {
      setIsDownloading(false);
    }
  }, [state.result]);

  const handleExportToFolder = useCallback(async () => {
    if (!state.result) return;
    if (!('showDirectoryPicker' in window)) {
      alert("Seu navegador não suporta exportação direta de pastas. Use o ZIP.");
      return;
    }
    setIsExporting(true);
    try {
      const directoryHandle = await (window as any).showDirectoryPicker();
      for (const file of state.result.files) {
        const paths = file.path.split('/');
        let currentHandle = directoryHandle;
        for (let i = 0; i < paths.length - 1; i++) {
          currentHandle = await currentHandle.getDirectoryHandle(paths[i], { create: true });
        }
        const fileName = paths[paths.length - 1];
        const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file.content);
        await writable.close();
      }
      alert("Base exportada com sucesso!");
    } catch (err: any) {
      if (err.name !== 'AbortError') alert(`Erro: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  }, [state.result]);

  return (
    <div className="flex h-screen w-screen overflow-hidden text-slate-200 bg-slate-950">
      <Sidebar 
        framework={framework}
        setFramework={setFramework}
        type={type}
        setType={setType}
        prompt={prompt}
        setPrompt={setPrompt}
        onGenerate={() => handleGenerate()}
        onImport={handleImport}
        onOpenTemplates={() => setShowTemplates(true)}
        onReset={handleReset}
        loading={state.loading}
        hasExistingFiles={!!state.result?.files?.length}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {state.loading && (
          <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tighter">Sincronizando com a Forja...</h2>
            <p className="text-slate-400 max-w-md text-sm">A IA está realizando uma auditoria profunda na sua base e arquitetando as melhorias necessárias.</p>
          </div>
        )}

        {showTemplates && (
          <TemplateGallery 
            onClose={() => setShowTemplates(false)} 
            onSelect={handleSelectTemplate} 
            isLoading={isCloning}
          />
        )}

        {state.error && (
          <div className="m-8 p-6 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200">
            <h3 className="text-lg font-bold mb-2">Erro de Processamento</h3>
            <p className="text-sm opacity-80">{state.error}</p>
            <button 
              onClick={() => setState(prev => ({ ...prev, error: null }))}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Entendido
            </button>
          </div>
        )}

        {state.result ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-white tracking-tight">{state.result.name}</h2>
                    <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">Ativo</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-[10px] font-bold border border-indigo-500/30 uppercase">
                      {framework}
                    </span>
                    <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase">
                      {type}
                    </span>
                    {state.result.recommendations && state.result.recommendations.length > 0 && (
                       <button 
                         onClick={() => setShowAudit(!showAudit)}
                         className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all flex items-center gap-2 ${
                           showAudit ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'
                         }`}
                       >
                         <div className={`w-1.5 h-1.5 rounded-full ${showAudit ? 'bg-amber-500' : 'bg-slate-500'}`}></div>
                         {showAudit ? 'Ocultar Auditoria' : `Ver Auditoria (${state.result.recommendations.length})`}
                       </button>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleExportToFolder}
                    disabled={isExporting || isDownloading || state.loading}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl font-bold border border-slate-700 transition-all disabled:opacity-50 text-sm"
                  >
                    Exportar Pasta
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading || isExporting || state.loading}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 text-sm"
                  >
                    Baixar ZIP
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden">
                <CodeViewer files={state.result.files} structure={state.result.structure} />
              </div>

              {showAudit && state.result.recommendations && state.result.recommendations.length > 0 && (
                <AIRecommendations 
                  recommendations={state.result.recommendations} 
                  onApply={handleApplyRecommendation}
                />
              )}
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 max-h-40 overflow-y-auto custom-scrollbar">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Log de Operações / Instruções</h4>
               <div className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed font-mono">
                 {state.result.instructions}
               </div>
            </div>
          </div>
        ) : !state.loading && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-5xl mx-auto">
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative w-28 h-28 bg-slate-900 rounded-[2rem] flex items-center justify-center border border-slate-800 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">
              FiveM <span className="text-indigo-500">Forge AI</span>
            </h1>
            <p className="text-slate-400 text-xl mb-12 leading-relaxed max-w-2xl">
              A ferramenta definitiva para criar e auditar servidores FiveM profissionais com Inteligência Artificial.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4">
               <button 
                  onClick={handleStartFromScratch}
                  className="p-8 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 rounded-3xl text-left transition-all group shadow-xl shadow-indigo-500/20"
               >
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h4 className="text-white font-bold text-xl mb-2">Criar do Zero</h4>
                  <p className="text-sm text-indigo-100/70">Inicie um projeto limpo e deixe a IA planejar a estrutura ideal.</p>
               </button>

               <button 
                  onClick={() => setShowTemplates(true)}
                  className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-left hover:bg-slate-800 transition-all group border-dashed hover:border-indigo-500/50"
               >
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h4 className="text-white font-bold text-xl mb-2">Usar Templates</h4>
                  <p className="text-sm text-slate-500">Comece com QBCore/ESX e use a auditoria para expandir.</p>
               </button>

               <div className="p-8 bg-slate-900/50 border border-slate-800/50 rounded-3xl text-left flex flex-col justify-center grayscale opacity-60">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-slate-400 font-bold text-xl mb-2">Forge Pro</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 w-fit px-2 py-0.5 rounded">Em Breve</p>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
