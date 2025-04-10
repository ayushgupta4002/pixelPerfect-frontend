import React from 'react';
import { Camera, Wand2, Layers, Image as ImageIcon, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800">
      {/* Navigation */}
      <nav className="px-6 py-4 backdrop-blur-lg bg-zinc-900/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-8 h-8 text-zinc-200" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-200 cursor-pointer to-slate-400 bg-clip-text text-transparent">PixelPerfect</h1>

          </div>
          {/* <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-zinc-400 hover:text-zinc-200 transition-colors">Features</a>
            <a href="#pricing" className="text-zinc-400 hover:text-zinc-200 transition-colors">Pricing</a>
            <a href="#about" className="text-zinc-400 hover:text-zinc-200 transition-colors">About</a>
          </div> */}
                      <Link href={"/editor"}>

          <button className="px-6 py-2 rounded-full bg-gradient-to-r from-zinc-800 to-zinc-700 text-zinc-100 font-medium hover:from-zinc-700 hover:to-zinc-600 transition-all border border-zinc-600">
            Get Started
          </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl h-[calc(100vh-4rem)] mx-auto px-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-zinc-200 via-white to-zinc-200 text-transparent bg-clip-text">
              Transform Your Images
            </span>
          </h1>
          <p className="text-zinc-400 text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
            Professional-grade image editing tools in your browser. Create stunning visuals with just a few clicks.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href={"/editor"}>
            <button className="px-8 py-4 rounded-full bg-gradient-to-r from-zinc-800 to-zinc-700 text-zinc-100 font-medium hover:from-zinc-700 hover:to-zinc-600 transition-all border border-zinc-600 flex items-center gap-2">
              Start Editing Now
              <ChevronRight className="w-5 h-5" />
            </button></Link>
            <button className="px-8 py-4 rounded-full border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800/50 transition-all">
              Watch Demo
            </button>
          </div>
        </div>



        {/* Preview Section */}
        {/* <div className="mt-32 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1498075702571-ecb018f3752d?auto=format&fit=crop&w=2000"
            alt="Editor Preview" 
            className="w-full h-[600px] object-cover rounded-3xl opacity-30"
          />
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-zinc-200 to-white text-transparent bg-clip-text">
                Start Creating Today
              </h2>
              <button className="px-8 py-4 rounded-full bg-gradient-to-r from-zinc-800 to-zinc-700 text-zinc-100 font-medium hover:from-zinc-700 hover:to-zinc-600 transition-all border border-zinc-600">
                Try For Free
              </button>
            </div>
          </div>
        </div> */}
      </main>
    </div>
  );
}

export default Page;