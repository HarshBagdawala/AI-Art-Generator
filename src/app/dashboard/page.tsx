'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ImageIcon, 
  CheckCircle2, 
  Clock, 
  RefreshCcw,
  Search,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import StatsCard from '@/components/Dashboard/StatsCard';
import ImageGrid from '@/components/Dashboard/ImageGrid';
import RecentActivity from '@/components/Dashboard/RecentActivity';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalGenerations: 0,
    activeUsers: 0,
    successRate: 0,
    avgTime: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Images
      const { data: imgData } = await supabase
        .from('image_generations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12);
      
      if (imgData) setImages(imgData);

      // Fetch Recent Activity
      const { data: actData } = await supabase
        .from('image_generations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (actData) setActivities(actData);

      // Fetch Stats
      const { count: totalGen } = await supabase
        .from('image_generations')
        .select('*', { count: 'exact', head: true });

      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalGenerations: totalGen || 0,
        activeUsers: totalUsers || 0,
        successRate: 98, // Mocked for now or calculate from daily_stats
        avgTime: 12.4 // Mocked for now
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Real-time subscription could be added here
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="px-6 pb-20 max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-4 md:space-y-0 text-white">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-gray-500 font-medium">Real-time overview of ArtBot performance and creations.</p>
        </div>
        
        <button 
          onClick={fetchData}
          className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-all text-sm font-bold uppercase tracking-widest text-gray-300"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatsCard 
          title="Total Images" 
          value={stats.totalGenerations.toLocaleString()} 
          icon={ImageIcon} 
          trend="12%" 
          trendUp={true} 
        />
        <StatsCard 
          title="Active Users" 
          value={stats.activeUsers.toLocaleString()} 
          icon={Users} 
          trend="5%" 
          trendUp={true} 
        />
        <StatsCard 
          title="Success Rate" 
          value={`${stats.successRate}%`} 
          icon={CheckCircle2} 
        />
        <StatsCard 
          title="Avg. Time" 
          value={`${stats.avgTime}s`} 
          icon={Clock} 
        />
      </div>

      {/* Main Content Grid */}
      <div className="space-y-12">
        {/* Gallery Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-purple-500" />
              Latest Creations
            </h2>
            <div className="flex items-center space-x-2">
              <div className="relative group">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-purple-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search prompts..." 
                  className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 transition-all w-48 md:w-64"
                />
              </div>
            </div>
          </div>
          <ImageGrid images={images} />
        </section>

        {/* Activity Table */}
        <section>
          <RecentActivity activities={activities} />
        </section>
      </div>
    </div>
  );
}
