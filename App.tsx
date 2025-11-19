import React, { useState, useEffect, useRef } from 'react';
import { SettingsModal } from './components/SettingsModal';
import { SketchResult } from './components/SketchResult';
import { Gallery } from './components/Gallery';
import { generateSketch } from './services/geminiService';
import { SketchState, GalleryItem, RoofMaterial } from './types';

export default function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Image Upload States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [sketchState, setSketchState] = useState<SketchState>({ status: 'idle' });
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<RoofMaterial>('Asphalt Shingles');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PWA Install Logic
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    const storedKey = localStorage.getItem('gemini_api_key');
    const envKey = process.env.API_KEY;
    if (storedKey) setApiKey(storedKey);
    else if (envKey) setApiKey(envKey);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setInstallPrompt(null);
        }
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Reset all states
      setUploadError(null);
      setSketchState({ status: 'idle' });
      setImagePreview(null);
      setImageFile(null);
      setIsProcessingImage(true);

      // 1. Validate File Type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Unsupported format. Use JPG, PNG, or WEBP.');
        setIsProcessingImage(false);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        
        // 2. Validate Dimensions (Async)
        const img = new Image();
        img.src = result;
        img.onload = () => {
            if (img.width < 256 || img.height < 256) {
                setUploadError(`Image too small. Min 256x256px.`);
                setIsProcessingImage(false);
                return;
            }
            
            setImageFile(file);
            setImagePreview(result);
            setIsProcessingImage(false);
        };
        img.onerror = () => {
            setUploadError('Failed to process image data.');
            setIsProcessingImage(false);
        };
      };
      reader.onerror = () => {
          setUploadError('Error reading file.');
          setIsProcessingImage(false);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }
    if (!imageFile || !imagePreview) return;

    setSketchState({ status: 'loading' });

    try {
      const base64Data = imagePreview.split(',')[1];
      const mimeType = imageFile.type;

      const url = await generateSketch(apiKey, base64Data, mimeType, selectedMaterial);
      setSketchState({ status: 'success', sketchUrl: url });

      // Add to gallery
      setGallery(prev => [{
        id: Date.now().toString(),
        sketchUrl: url,
        timestamp: Date.now()
      }, ...prev]);

    } catch (err: any) {
      setSketchState({ status: 'error', errorMessage: err.message });
    }
  };

  const MaterialOption = ({ label, value }: { label: string, value: RoofMaterial }) => (
    <button
        onClick={() => setSelectedMaterial(value)}
        className={`
            flex-1 py-2.5 text-[13px] font-medium rounded-full transition-all duration-300
            ${selectedMaterial === value 
                ? 'bg-zinc-800 text-white shadow-lg shadow-black/20 ring-1 ring-white/10' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
            }
        `}
    >
        {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center font-sans selection:bg-blue-500/30">
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiKey={apiKey} 
        setApiKey={setApiKey} 
      />

      {/* Floating Navbar */}
      <nav className="fixed top-6 z-40 w-[90%] max-w-md bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl px-5 py-3 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/20">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <h1 className="text-sm font-semibold text-white tracking-tight">Roof Sketcher</h1>
        </div>
        
        <div className="flex items-center gap-2">
            {installPrompt && (
               <button onClick={handleInstallClick} className="text-[10px] font-bold bg-white text-black px-3 py-1.5 rounded-full hover:bg-zinc-200 transition-colors">
                 GET APP
               </button>
            )}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-zinc-400 hover:text-white bg-transparent hover:bg-white/10 rounded-full transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-md px-6 pt-28 pb-10 flex flex-col gap-8">
        
        {/* Upload Surface */}
        <div className="space-y-4">
            {!imagePreview && (
                <div className="px-2">
                    <h2 className="text-2xl font-semibold text-white mb-1">Create Sketch</h2>
                    <p className="text-sm text-zinc-400">Upload a top-down photo to begin.</p>
                </div>
            )}

            <div 
            onClick={() => !isProcessingImage && fileInputRef.current?.click()}
            className={`
                relative group cursor-pointer transition-all duration-500 ease-out overflow-hidden
                ${imagePreview 
                    ? 'rounded-3xl shadow-2xl shadow-black/50 bg-black/50' 
                    : 'bg-zinc-900/40 border border-white/10 hover:bg-zinc-900/60 hover:border-white/20 rounded-3xl h-64'
                }
                ${uploadError ? 'border-red-500/50 bg-red-900/10' : ''}
            `}
            >
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/jpeg, image/png, image/webp" 
                className="hidden" 
                disabled={isProcessingImage}
            />
            
            {/* Processing Overlay */}
            {isProcessingImage && (
                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center h-64 rounded-3xl">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                </div>
            )}

            {/* Error State */}
            {!isProcessingImage && uploadError && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 h-64">
                    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <p className="text-red-400 text-sm font-medium mb-1">{uploadError}</p>
                    <span className="text-xs text-red-400/60">Tap to try again</span>
                </div>
            )}
            
            {/* Preview State */}
            {!isProcessingImage && !uploadError && imagePreview ? (
                <>
                    <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-auto max-h-[50vh] object-contain" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                         <span className="text-xs font-medium text-white/80 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full self-center border border-white/10">Tap to replace</span>
                    </div>
                </>
            ) : (
                /* Empty State */
                !isProcessingImage && !uploadError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    <div className="p-4 bg-zinc-800/50 rounded-full mb-4 group-hover:scale-110 transition-transform duration-500 ease-out">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <span className="text-sm font-medium">Tap to upload image</span>
                </div>
                )
            )}
            </div>
        </div>
        
        {/* Material Selector */}
        {imagePreview && !uploadError && (
            <div className="bg-zinc-900/40 p-1 rounded-full border border-white/5 flex gap-1 animate-fade-in-up">
                <MaterialOption label="Shingle" value="Asphalt Shingles" />
                <MaterialOption label="Tile" value="Clay Tile" />
                <MaterialOption label="Metal" value="Metal Standing Seam" />
            </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleGenerate}
          disabled={!imagePreview || !!uploadError || sketchState.status === 'loading' || isProcessingImage}
          className={`
            w-full py-4 rounded-full font-semibold text-[15px] tracking-wide
            transition-all duration-300 transform active:scale-[0.98]
            ${!imagePreview || !!uploadError || sketchState.status === 'loading' || isProcessingImage
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
            }
          `}
        >
          {sketchState.status === 'loading' ? (
             <span className="flex items-center justify-center gap-2">
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
               Generating...
             </span>
          ) : 'Generate Sketch'}
        </button>

        {/* Error Message */}
        {sketchState.status === 'error' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm text-center animate-fade-in-up">
            {sketchState.errorMessage}
          </div>
        )}

        {/* Results & Gallery */}
        <div className="space-y-12">
            {sketchState.status === 'success' && sketchState.sketchUrl && (
            <SketchResult sketchUrl={sketchState.sketchUrl} />
            )}

            <Gallery items={gallery} />
        </div>
        
      </main>
    </div>
  );
}