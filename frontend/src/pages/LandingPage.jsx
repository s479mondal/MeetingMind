import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Mic, 
  Languages, 
  Brain, 
  ListTodo, 
  History, 
  FileCheck2 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-white selection:bg-violet-500 selection:text-white">
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[150px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[150px]" />

      {/* Header */}
      <header className="mx-auto max-w-7xl px-6 py-6 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-600/30">
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
            </div>
            <span className="font-sans text-xl font-bold tracking-tight">MeetingMind</span>
          </div>
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold hover:bg-white/20 transition-all"
          >
            Launch Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 pt-16 pb-24 md:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-semibold text-violet-300 mb-8">
          <Sparkles className="h-4 w-4" /> Powered by Advanced Speech-to-Text & LLMs
        </div>
        
        <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight sm:text-7xl leading-tight">
          Turn Every Meeting Into <br/>
          <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Actionable Intelligence.
          </span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
          Upload your meeting audio. Instantly get speaker-highlighted transcription, concise summary, key decisions, and auto-assigned action items.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link 
            to="/upload" 
            className="group flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-4 font-bold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-500 hover:-translate-y-0.5 transition-all duration-200"
          >
            Upload Meeting <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/dashboard" 
            className="rounded-xl border border-slate-700 bg-slate-800/40 px-8 py-4 font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
          >
            View Demo Dashboard
          </Link>
        </div>

        {/* Pipeline Diagram */}
        <section className="mt-24">
          <h2 className="text-2xl font-bold text-slate-300 mb-12">Processing Pipeline</h2>
          
          <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connecting lines for desktop */}
            <div className="absolute top-1/2 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hidden md:block -z-10 -translate-y-1/2" />
            
            {/* Step 1 */}
            <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 mb-4 border border-violet-500/20">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-1">Audio</h3>
              <p className="text-xs text-slate-400 text-center">MP3, WAV, M4A recorded meeting files</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 mb-4 border border-indigo-500/20">
                <Languages className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-1">AI Transcription</h3>
              <p className="text-xs text-slate-400 text-center">Speech-to-text with speech diarization</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 mb-4 border border-purple-500/20">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-1">Intelligence</h3>
              <p className="text-xs text-slate-400 text-center">LLM semantic analysis & summary extraction</p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 mb-4 border border-emerald-500/20">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-1">Actionable Results</h3>
              <p className="text-xs text-slate-400 text-center">Interactive dashboard with decisions & tasks</p>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="mt-28 border-t border-slate-800 pt-20">
          <div className="text-left mb-16">
            <h2 className="text-3xl font-black tracking-tight">Key Features</h2>
            <p className="text-slate-400 mt-2">Everything you need to automate meeting administration.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-violet-500/30 transition-colors">
              <Languages className="h-8 w-8 text-violet-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Whisper AI Transcription</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Industry-leading speech recognition maps audio files into detailed, searchable textual transcripts with timestamps.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-violet-500/30 transition-colors">
              <Brain className="h-8 w-8 text-indigo-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Intelligent AI Summaries</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Say goodbye to blocky text. Get executive summaries, key decisions, and conversation insights generated instantly.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-violet-500/30 transition-colors">
              <ListTodo className="h-8 w-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Action Items Tracker</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Extracted tasks are structured into columns (Assignee, Priority, Deadline) and can be checked, filtered, and managed.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-violet-500/30 transition-colors">
              <History className="h-8 w-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Searchable History</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Keep all your historical meetings in one place. Easily search, sort, and retrieve summaries at any time.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-violet-500/30 transition-colors">
              <Sparkles className="h-8 w-8 text-amber-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">AI Meeting Insights</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Extract hidden metadata like unresolved issues, future risks, meeting tone, and post-discussion recommendations.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-violet-500/30 transition-colors">
              <FileCheck2 className="h-8 w-8 text-rose-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Demo / Mock Mode</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Don't have API keys yet? Easily toggle a mock pipeline in settings to see full system capability with sample meetings.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-850 bg-slate-950 py-12 text-center text-slate-500 text-sm">
        <p>© 2026 MeetingMind. Built with React, Spring Boot, MongoDB, and OpenAI.</p>
      </footer>
    </div>
  );
}
