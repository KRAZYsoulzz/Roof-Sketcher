import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKey, setApiKey }) => {
  const [tempKey, setTempKey] = useState(apiKey);

  useEffect(() => {
    setTempKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    if (!tempKey) {
        onClose();
        return;
    }
    // Aggressively clean the key: removes spaces, tabs, newlines, and invisible unicode chars (like zero-width spaces)
    const cleanedKey = tempKey.replace(/[\s\u200B-\u200D\uFEFF]/g, '');
    
    setApiKey(cleanedKey);
    localStorage.setItem('gemini_api_key', cleanedKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Modal Card */}
      <div className="w-full max-w-sm bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 relative overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-white tracking-tight">Settings</h2>
          <button 
            onClick={onClose} 
            className="p-2 -mr-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider ml-1">Gemini API Key</label>
            <div className="relative">
                <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Paste API Key"
                className="w-full px-5 py-4 bg-black/20 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-zinc-600 outline-none transition-all text-[15px]"
                />
            </div>
            <p className="text-[11px] text-zinc-500 mt-3 ml-1 leading-relaxed">
              Stored locally on your device. Never shared.
            </p>
          </div>

          {/* Help Link */}
          <div className="bg-blue-500/10 rounded-2xl p-4 border border-blue-500/10">
             <p className="text-xs text-blue-200 mb-2">Need an API Key?</p>
             <a 
               href="https://aistudio.google.com/app/apikey" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
             >
               <span>Get one from Google AI Studio</span>
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
             </a>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium text-[15px] rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};