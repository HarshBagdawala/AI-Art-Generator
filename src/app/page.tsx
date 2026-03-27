'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Image as ImageIcon, Zap, Globe, Shield, RefreshCw } from 'lucide-react';

export default function LandingPage() {
  const features = [
    { icon: Globe, title: "Multilingual", desc: "Hindi, English, Hinglish, Gujarati - we understand them all." },
    { icon: Zap, title: "Lighting Fast", desc: "Get your AI-generated art back in just 10-15 seconds." },
    { icon: Shield, title: "Completely Free", desc: "No subscriptions, no hidden costs. Pure art for everyone." },
    { icon: ImageIcon, title: "HD Quality", desc: "Stunning high-resolution images powered by Flux models." },
  ];

  const steps = [
    { num: "01", title: "Message", desc: "Send any text prompt to our WhatsApp number." },
    { num: "02", title: "Enhance", desc: "Our AI optimizes your prompt for the best results." },
    { num: "03", title: "Create", desc: "Receive your unique artwork directly in the chat." },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Powered by Pollinations.AI</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-none"
          >
            Turn Words into <br />
            <span className="text-gradient">Art, Instantly.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium"
          >
            Send any message in Hindi, English, or Hinglish via WhatsApp and get a stunning AI-generated image back in seconds.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <Link href="https://wa.me/your_number" target="_blank">
              <button className="btn-primary flex items-center space-x-3 group">
                <MessageSquare className="w-5 h-5 group-hover:animate-bounce" />
                <span>Try it Now on WhatsApp</span>
              </button>
            </Link>
            
            <Link href="/dashboard">
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 backdrop-blur-sm">
                Explore Gallery
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-purple-600/20 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-pink-600/10 blur-[150px] rounded-full translate-x-1/2 pointer-events-none" />
      </section>

      {/* Steps Section */}
      <section className="py-24 px-6 bg-[#050508]/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-500"
              >
                <span className="text-6xl font-black text-white/5 absolute top-4 right-8 group-hover:text-purple-500/10 transition-colors">
                  {step.num}
                </span>
                <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Everything You Need</h2>
            <p className="text-gray-500">The most seamless AI art generation experience on your phone.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-[#13131A] border border-white/10 hover:border-purple-500/50 transition-all group"
              >
                <div className="bg-purple-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Gallery Preview Call */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-8">Ready to start creating?</h2>
        <Link href="https://wa.me/your_number" target="_blank">
          <button className="btn-primary group">
            Send a message to ArtBot
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center">
        <div className="flex items-center justify-center space-x-6 mb-6">
          <a href="#" className="text-gray-500 hover:text-white transition-colors">Privacy</a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors">Terms</a>
          <a href="https://github.com" className="text-gray-500 hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
        </div>
        <p className="text-gray-600 text-xs tracking-widest uppercase font-bold">
          © {new Date().getFullYear()} ArtBot AI. No Rights Reserved. Built for Fun.
        </p>
      </footer>
    </div>
  );
}
