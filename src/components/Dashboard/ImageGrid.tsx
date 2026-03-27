'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Clock, Phone } from 'lucide-react';

interface ImageGeneration {
  id: string;
  image_url: string;
  original_prompt: string;
  enhanced_prompt: string;
  phone_number: string;
  created_at: string;
  processing_time_ms: number;
}

interface ImageGridProps {
  images: ImageGeneration[];
}

const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {
  const maskPhone = (phone: string) => {
    if (!phone) return 'Unknown';
    return phone.replace(/(\+\d{2} \d{3})\d{3}(\d{3})/, '$1*** ***$2');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((img, index) => (
        <motion.div
          key={img.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="group relative bg-[#13131A] rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all duration-300"
        >
          <div className="aspect-square overflow-hidden relative">
            <img 
              src={img.image_url} 
              alt={img.original_prompt}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <p className="text-white text-xs line-clamp-3 mb-2 font-medium italic">
                "{img.enhanced_prompt}"
              </p>
              <div className="flex justify-between items-center">
                <span className="text-purple-400 text-[10px] uppercase font-bold tracking-widest flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {img.processing_time_ms / 1000}s
                </span>
                <a 
                  href={img.image_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg backdrop-blur-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <p className="text-white font-medium text-sm truncate mb-2" title={img.original_prompt}>
              {img.original_prompt}
            </p>
            <div className="flex items-center justify-between text-gray-500 text-[10px]">
              <div className="flex items-center">
                <Phone className="w-3 h-3 mr-1" />
                {maskPhone(img.phone_number)}
              </div>
              <span>{new Date(img.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ImageGrid;
