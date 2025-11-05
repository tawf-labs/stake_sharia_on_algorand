import React, { memo } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import Navbar from './components/nav';
import Plasma from './components/Plasma'

const MainContent = memo(() => (
  <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 text-center pt-24">
    {/* Badge */}
    <div className="flex items-center gap-4 mb-8">
      <div className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-full cursor-pointer transition-all shadow-lg shadow-emerald-500/50">
        <span className="font-semibold">Now Live</span>
        <Sparkles className="w-4 h-4" />
      </div>
      <button className="flex items-center gap-2 text-gray-300 hover:text-white transition group">
        <span>View on Algorand</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>

    {/* Heading */}
    <h1 className="text-6xl sm:text-7xl font-bold mb-6 max-w-5xl leading-tight">
      Halal Staking for a
      <br />
      <span className="text-emerald-400">Trustworthy DeFi Future</span>
    </h1>

    {/* Subtitle */}
    <p className="text-xl text-gray-400 mb-12 max-w-2xl">
      Tawf Sharia empowers Muslim investors to earn halal passive income
      <br />
      through Sharia-audited staking — secure, ethical, and fully on Algorand.
    </p>

    {/* CTA Buttons */}
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <button className="bg-emerald-600 hover:bg-emerald-700 px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-xl shadow-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/60 hover:scale-105">
        Start Halal Staking
      </button>
      <button className="border border-emerald-500/50 hover:border-emerald-400 px-8 py-4 rounded-full text-lg font-semibold text-emerald-300 hover:text-white transition-all hover:bg-emerald-500/10">
        Learn More
      </button>
    </div>
  </main>
));


MainContent.displayName = 'MainContent';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Plasma Background */}
      <div className="absolute inset-0">
        <Plasma
          color="#50C878"
          speed={0.5}
          direction="forward"
          scale={1.2}
          opacity={0.7}
          mouseInteractive={true}
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-950/50"></div>

      {/* Navbar Component */}
      <Navbar />

      {/* Main Content */}
      <MainContent />
    </div>
  );
}
