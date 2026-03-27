'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Palette, LayoutDashboard, Home, Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-[#13131A]/80 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3 shadow-2xl overflow-hidden relative">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none" />
        
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg group-hover:rotate-12 transition-transform duration-300">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-display uppercase tracking-tight">
            ArtBot
          </span>
        </Link>

        <div className="flex items-center space-x-1 sm:space-x-4">
          <Link href="/">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              pathname === '/' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}>
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Home</span>
            </div>
          </Link>
          <Link href="/dashboard">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              pathname === '/dashboard' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}>
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
            </div>
          </Link>
          
          <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block" />
          
          <div className="flex items-center space-x-2 text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20 text-[10px] font-bold uppercase tracking-widest">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Connected</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
