import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { meetingService } from '../services/api';
import { 
  Sparkles, 
  FileText, 
  CheckSquare, 
  Clock, 
  Upload, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    meetingService.getMeetings()
      .then(res => {
        setMeetings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load dashboard metrics:", err);
        setError("Could not connect to backend server. Make sure the Spring Boot service is running.");
        setLoading(false);
      });
  }, []);

  // Calculate metrics
  const totalProcessed = meetings.filter(m => m.status === 'COMPLETED').length;
  const processingCount = meetings.filter(m => m.status !== 'COMPLETED' && m.status !== 'FAILED').length;
  
  let totalActionItems = 0;
  let pendingActionItems = 0;
  let completedActionItems = 0;

  meetings.forEach(m => {
    if (m.actionItems) {
      totalActionItems += m.actionItems.length;
      pendingActionItems += m.actionItems.filter(item => item.status !== 'COMPLETED').length;
      completedActionItems += m.actionItems.filter(item => item.status === 'COMPLETED').length;
    }
  });

  const recentMeetings = meetings.slice(0, 3);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 rounded bg-slate-200 dark:bg-darkbg-800 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-darkbg-800 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-darkbg-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Workspace Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">AI meeting intelligence metrics and activity feed.</p>
        </div>
        <Link 
          to="/upload" 
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-500 transition-all duration-200"
        >
          <Upload className="h-4 w-4" /> Upload Meeting
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Backend Offline</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-darkbg-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Processed Meetings</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{totalProcessed}</span>
            {processingCount > 0 && (
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 animate-pulse">
                ({processingCount} processing)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Transcripts saved to MongoDB</p>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-darkbg-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Action Items</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
              <CheckSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{pendingActionItems}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">pending / {totalActionItems} total</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{completedActionItems} tasks completed</p>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-darkbg-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Minutes Analyzed</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {meetings.reduce((acc, m) => acc + (m.duration || 0), 0).toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">min</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">ASR audio transcription duration</p>
        </div>
      </div>

      {/* Main Grid: Recent Meetings and Active Pipelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Meetings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Summarized Meetings</h2>
            <Link to="/meetings" className="text-xs font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentMeetings.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
                <FileText className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">No meetings yet</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Upload an audio file of your discussion to automatically transcribe, summarize, and outline action items.
                </p>
                <Link 
                  to="/upload" 
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              recentMeetings.map(meeting => (
                <Link 
                  key={meeting.id}
                  to={`/meetings/${meeting.id}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-violet-300 dark:border-slate-800 dark:bg-darkbg-900 dark:hover:border-violet-900/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate">{meeting.title || 'Untitled Meeting'}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>{new Date(meeting.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{meeting.duration ? `${meeting.duration.toFixed(1)} min` : 'Duration unknown'}</span>
                        <span>•</span>
                        <span>{(meeting.actionItems || []).length} action items</span>
                      </div>
                    </div>
                    
                    <div>
                      {meeting.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                          Success
                        </span>
                      ) : meeting.status === 'FAILED' ? (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/30 dark:text-red-400">
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 animate-pulse">
                          {meeting.status}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Info panel / CTA */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quick Help</h2>
          
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white shadow-lg">
            <Sparkles className="h-8 w-8 text-violet-200 mb-4 animate-bounce" />
            <h3 className="font-bold text-lg">MeetingMind AI</h3>
            <p className="text-sm text-violet-100 mt-2 leading-relaxed">
              Powered by Groq's free Whisper ASR and LLaMA 3.3 for real-time transcription and meeting summarization. Configure your Groq API key in Settings to get started.
            </p>
            <div className="mt-6">
              <Link 
                to="/settings" 
                className="inline-flex items-center gap-1 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-violet-700 hover:bg-violet-50 transition-colors"
              >
                Go to Settings <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
