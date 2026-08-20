import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { meetingService } from '../services/api';
import { 
  FileText, 
  Search, 
  Trash2, 
  ChevronRight, 
  Calendar, 
  Clock, 
  CheckSquare, 
  FolderOpen,
  ArrowUpDown,
  AlertCircle,
  Upload
} from 'lucide-react';

export default function MeetingHistory() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc'); // options: createdAt_desc, createdAt_asc, title_asc, duration_desc

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = () => {
    setLoading(true);
    meetingService.getMeetings()
      .then(res => {
        setMeetings(res.data);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch meetings list:", err);
        setError("Unable to communicate with the Spring Boot server. Please make sure the backend is active.");
        setLoading(false);
      });
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this meeting summary and all its data? This action is permanent.")) return;

    try {
      await meetingService.deleteMeeting(id);
      // Remove from local state
      setMeetings(meetings.filter(m => m.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete meeting.");
    }
  };

  // Client-side search and sort
  const filteredMeetings = meetings.filter(m => {
    const titleMatch = m.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const transcriptMatch = m.transcript?.toLowerCase().includes(searchQuery.toLowerCase());
    const summaryMatch = m.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || transcriptMatch || summaryMatch;
  });

  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    if (sortBy === 'createdAt_desc') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'createdAt_asc') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === 'title_asc') {
      return (a.title || '').localeCompare(b.title || '');
    }
    if (sortBy === 'duration_desc') {
      return (b.duration || 0) - (a.duration || 0);
    }
    return 0;
  });

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Meeting Repository</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Browse and manage all previously analyzed discussions.
          </p>
        </div>
        <Link 
          to="/upload" 
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-500 transition-colors"
        >
          New Meeting
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300 animate-pulse">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Connection Error</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
          <button onClick={fetchMeetings} className="text-xs font-bold hover:underline">
            Retry Connection
          </button>
        </div>
      )}

      {/* Toolbar / Search & Sort */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white dark:bg-darkbg-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search meetings, summaries, or transcripts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-11 pr-4 py-2.5 bg-white text-slate-900 focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-darkbg-850 dark:text-white"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-slate-500" />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-darkbg-850 dark:text-white"
          >
            <option value="createdAt_desc">Date: Newest First</option>
            <option value="createdAt_asc">Date: Oldest First</option>
            <option value="title_asc">Title: A-Z</option>
            <option value="duration_desc">Duration: Longest First</option>
          </select>
        </div>
      </div>

      {/* Grid of Meetings */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-slate-200 dark:bg-darkbg-800 animate-pulse" />
          ))}
        </div>
      ) : sortedMeetings.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-850 p-12 text-center max-w-lg mx-auto">
          <FolderOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-slate-850 dark:text-white">No meetings found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {searchQuery ? "No results match your search parameters. Try adjusting your query keywords." : "Upload a recording to populate your intelligence directory."}
          </p>
          {!searchQuery && (
            <Link 
              to="/upload" 
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/10"
            >
              <Upload className="h-4 w-4" /> Upload First Meeting
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMeetings.map(meeting => (
            <Link 
              key={meeting.id}
              to={`/meetings/${meeting.id}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-violet-300 dark:border-slate-800 dark:bg-darkbg-900 dark:hover:border-violet-900/50 transition-all duration-200"
            >
              {/* Header Info */}
              <div className="space-y-2 flex flex-col items-start w-full">
                <div className="flex items-start justify-between gap-4 w-full">
                  <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {meeting.title || 'Untitled Meeting'}
                  </h3>
                  
                  {meeting.status !== 'COMPLETED' && (
                    <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 animate-pulse">
                      {meeting.status}
                    </span>
                  )}
                </div>

                {meeting.summarizerProvider && (
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                    meeting.summarizerProvider === 'groq' 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                      : meeting.summarizerProvider === 'gemini'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                  }`}>
                    {meeting.summarizerProvider === 'groq' 
                      ? 'Llama 3.3 70B (Groq)' 
                      : meeting.summarizerProvider === 'gemini'
                        ? 'Gemini 3.6 Flash'
                        : `Custom: ${meeting.summarizerModel || 'LLM'}`}
                  </span>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {meeting.summary || 'No summary generated yet.'}
                </p>
              </div>

              {/* Footer Meta */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(meeting.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {meeting.duration ? `${meeting.duration.toFixed(1)}m` : '--'}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckSquare className="h-3.5 w-3.5" />
                    {(meeting.actionItems || []).length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => handleDelete(meeting.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-50 dark:hover:bg-darkbg-850"
                    title="Delete meeting"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
