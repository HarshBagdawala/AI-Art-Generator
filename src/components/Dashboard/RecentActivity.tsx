'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Activity {
  id: string;
  phone_number: string;
  original_prompt: string;
  detected_language: string;
  status: 'success' | 'failed' | 'pending';
  created_at: string;
  processing_time_ms: number;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <div className="bg-[#13131A] border border-white/10 rounded-2xl overflow-hidden glass-morphism">
      <div className="p-6 border-bottom border-white/5">
        <h3 className="text-xl font-bold text-white tracking-tight">Recent Activity</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest font-semibold font-display">
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Prompt</th>
              <th className="px-6 py-4">Language</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {activities.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-gray-300 font-medium text-sm">
                    {item.phone_number.substring(0, 6)}***{item.phone_number.slice(-2)}
                  </span>
                </td>
                <td className="px-6 py-4 max-w-xs truncate">
                  <span className="text-gray-400 text-sm italic">"{item.original_prompt}"</span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-purple-500/10 text-purple-400 text-[10px] px-2 py-1 rounded-full border border-purple-500/20 font-bold uppercase tracking-wider">
                    {item.detected_language}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      item.status === 'success' ? 'bg-green-500' : 
                      item.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <span className={`text-xs font-semibold capitalize ${
                      item.status === 'success' ? 'text-green-400' : 
                      item.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <span className="text-gray-400 text-xs font-mono">
                    {item.processing_time_ms}ms
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivity;
