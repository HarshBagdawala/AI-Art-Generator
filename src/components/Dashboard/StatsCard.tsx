'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, trendUp }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#13131A] border border-white/10 rounded-2xl p-6 glass-morphism overflow-hidden relative"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
          
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
              <span className="font-semibold">{trendUp ? '↑' : '↓'} {trend}</span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 rounded-xl border border-white/5">
          <Icon className="w-6 h-6 text-purple-400" />
        </div>
      </div>
      
      {/* Background Glow */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-600/10 blur-[50px] rounded-full pointer-events-none" />
    </motion.div>
  );
};

export default StatsCard;
