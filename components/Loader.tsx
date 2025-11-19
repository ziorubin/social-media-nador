import React from 'react';
import { BrainCircuit, Eye, Sparkles } from 'lucide-react';
import { GenerationState } from '../types';

interface LoaderProps {
  state: GenerationState;
}

const Loader: React.FC<LoaderProps> = ({ state }) => {
  if (state.status === 'idle' || state.status === 'completed' || state.status === 'error') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full flex flex-col items-center text-center space-y-6">
        
        {state.status === 'analyzing_image' && (
          <>
            <div className="relative">
              <div className="absolute inset-0 animate-ping bg-blue-500/20 rounded-full"></div>
              <div className="p-4 bg-blue-500/10 rounded-full text-blue-400 animate-pulse">
                <Eye size={48} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Analyzing Visuals</h3>
              <p className="text-slate-400 mt-2">Gemini 2.5 Flash is decoding the image details...</p>
            </div>
          </>
        )}

        {state.status === 'thinking' && (
          <>
             <div className="relative">
              <div className="absolute inset-0 animate-spin-slow bg-purple-500/20 rounded-full blur-xl"></div>
              <div className="p-4 bg-purple-500/10 rounded-full text-purple-400">
                <BrainCircuit size={48} className="animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Formulating Strategy</h3>
              <p className="text-slate-400 mt-2">Gemini 3 Pro is thinking deeply about the perfect angle...</p>
              <div className="mt-4 h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-progress"></div>
              </div>
            </div>
          </>
        )}

        {state.status === 'generating' && (
           <>
             <div className="relative">
              <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-400 animate-bounce">
                <Sparkles size={48} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Crafting Copy</h3>
              <p className="text-slate-400 mt-2">Finalizing your campaign assets...</p>
            </div>
          </>
        )}
        
      </div>
    </div>
  );
};

export default Loader;
