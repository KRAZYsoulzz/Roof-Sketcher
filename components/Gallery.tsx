import React from 'react';
import { GalleryItem } from '../types';

interface GalleryProps {
  items: GalleryItem[];
}

export const Gallery: React.FC<GalleryProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <div className="w-full space-y-6 mt-12 animate-fade-in-up pb-12">
      <div className="flex items-center justify-between px-1">
        <span className="text-lg font-semibold text-white">History</span>
        <span className="text-xs text-zinc-500">{items.length} Items</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 aspect-square cursor-pointer">
            <img 
              src={item.sketchUrl} 
              alt="Saved Sketch" 
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <a 
                href={item.sketchUrl} 
                download={`roof-sketch-${item.id}.png`}
                className="p-2.5 bg-white rounded-full text-black shadow-lg hover:scale-110 transition-transform"
                title="Download"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};