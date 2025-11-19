import React from 'react';

interface SketchResultProps {
  sketchUrl: string;
}

export const SketchResult: React.FC<SketchResultProps> = ({ sketchUrl }) => {
  
  return (
    <div className="w-full animate-fade-in-up space-y-6">
      
      {/* Image Preview Container */}
      <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl shadow-black/50 group min-h-[20rem] border border-white/10">
        
        {/* Raster Image Render */}
        <div className="w-full h-full flex items-center justify-center bg-white p-8">
            <img 
                src={sketchUrl} 
                alt="Generated Architectural Sketch" 
                className="max-w-full max-h-full object-contain shadow-sm"
            />
        </div>

        {/* Floating Label */}
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/5 backdrop-blur-md rounded-full border border-black/5">
             <span className="text-[10px] font-semibold text-black/60 uppercase tracking-wider">Result</span>
        </div>
      </div>
      
      {/* Download Button */}
      <a
        href={sketchUrl}
        download="roof-sketch-v3.png"
        className="block w-full py-4 text-center bg-white text-black font-semibold text-[15px] rounded-full shadow-lg shadow-zinc-900/20 hover:bg-zinc-50 transition-all active:scale-[0.98]"
      >
        Download Sketch
      </a>
    </div>
  );
};