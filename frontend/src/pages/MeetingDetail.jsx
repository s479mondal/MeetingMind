import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { meetingService, actionItemService } from '../services/api';
import { 
  Calendar, 
  Clock, 
  CheckSquare, 
  Download, 
  Copy, 
  Search, 
  ArrowLeft, 
  FileText, 
  Play,
  Brain,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Clock3,
  Circle,
  HelpCircle,
  Menu
} from 'lucide-react';

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Navigation Tabs: 'overview', 'transcript', 'insights'
  const [activeTab, setActiveTab] = useState('overview');

  // Search Transcript state
  const [transcriptSearch, setTranscriptSearch] = useState('');
  
  // Action Items filter
  const [taskSearch, setTaskSearch] = useState('');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('ALL');
  const [taskStatusFilter, setTaskStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchMeetingDetails();
  }, [id]);

  const fetchMeetingDetails = () => {
    setLoading(true);
    meetingService.getMeeting(id)
      .then(res => {
        setMeeting(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load meeting details:", err);
        setError("Meeting not found or database connection timed out.");
        setLoading(false);
      });
  };

  // Toggle status of action item
  const handleToggleActionItemStatus = async (itemId, currentStatus) => {
    let nextStatus = 'PENDING';
    if (currentStatus === 'PENDING') nextStatus = 'IN_PROGRESS';
    else if (currentStatus === 'IN_PROGRESS') nextStatus = 'COMPLETED';
    else nextStatus = 'PENDING';

    try {
      const response = await actionItemService.updateActionItem(meeting.id, itemId, { status: nextStatus });
      // Update local state
      setMeeting({
        ...meeting,
        actionItems: meeting.actionItems.map(item => 
          item.id === itemId ? { ...item, status: nextStatus } : item
        )
      });
    } catch (err) {
      console.error("Failed to update task status:", err);
      alert("Error updating task status.");
    }
  };

  const handleCopyTranscript = () => {
    if (!meeting?.transcript) return;
    navigator.clipboard.writeText(meeting.transcript);
    alert("Transcript copied to clipboard!");
  };

  const handleDownloadTranscript = () => {
    if (!meeting?.transcript) return;
    const element = document.createElement("a");
    const file = new Blob([meeting.transcript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${meeting.title || 'Meeting'}_transcript.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">High</span>;
      case 'MEDIUM':
        return <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">Medium</span>;
      case 'LOW':
        return <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950/30 dark:text-sky-400">Low</span>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-emerald-500 fill-emerald-50 dark:fill-transparent" />;
      case 'IN_PROGRESS':
        return <Clock3 className="h-5 w-5 text-amber-500" />;
      case 'PENDING':
      default:
        return <Circle className="h-5 w-5 text-slate-350 dark:text-slate-600" />;
    }
  };

  // Filtered action items
  const filteredActionItems = (meeting?.actionItems || []).filter(item => {
    const textMatch = item.task?.toLowerCase().includes(taskSearch.toLowerCase()) || 
                      item.assignee?.toLowerCase().includes(taskSearch.toLowerCase());
    const priorityMatch = taskPriorityFilter === 'ALL' || item.priority === taskPriorityFilter;
    const statusMatch = taskStatusFilter === 'ALL' || item.status === taskStatusFilter;
    return textMatch && priorityMatch && statusMatch;
  });

  // Highlight matches in transcript
  const getHighlightedTranscript = () => {
    if (!meeting?.transcript) return '';
    if (!transcriptSearch.trim()) return meeting.transcript;

    const regex = new RegExp(`(${transcriptSearch.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = meeting.transcript.split(regex);
    return parts.map((part, idx) => 
      regex.test(part) ? <mark key={idx} className="bg-yellow-200 text-slate-900 rounded px-0.5">{part}</mark> : part
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-slate-200 rounded-full dark:bg-darkbg-800 animate-pulse" />
          <div className="h-10 w-64 bg-slate-200 rounded dark:bg-darkbg-800 animate-pulse" />
        </div>
        <div className="h-96 bg-slate-200 rounded-2xl dark:bg-darkbg-800 animate-pulse" />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/30 dark:bg-red-950/20 max-w-md mx-auto">
        <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h3 className="font-bold text-lg text-red-950 dark:text-red-300">Meeting Not Found</h3>
        <p className="text-sm text-red-700 dark:text-red-400 mt-2">{error || "Could not retrieve details."}</p>
        <button onClick={() => navigate('/meetings')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back CTA & Quick Stats Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <Link to="/meetings" className="rounded-xl border border-slate-200 dark:border-slate-850 p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-darkbg-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{meeting.title || 'Untitled Meeting'}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(meeting.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{meeting.duration ? `${meeting.duration.toFixed(1)} minutes` : 'Duration N/A'}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{meeting.fileName}</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mt-4">
          {[
            { id: 'overview', label: 'Intelligence Summary', icon: Brain },
            { id: 'transcript', label: 'Transcript', icon: MessageSquare },
            { id: 'insights', label: 'AI Insights', icon: Sparkles }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all -mb-px
                ${activeTab === tab.id 
                  ? 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}
              `}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABS CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main summary cards */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Executive Summary */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-darkbg-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-violet-500" /> Executive Summary
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                {meeting.summary || "No summary available."}
              </div>
            </section>

            {/* Action Items */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-darkbg-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-indigo-500" /> Action Items
                </h2>
                
                {/* Mini filters */}
                <div className="flex flex-wrap gap-2">
                  <input 
                    type="text"
                    placeholder="Search tasks..."
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none dark:border-slate-850 dark:bg-darkbg-850"
                  />
                  <select
                    value={taskPriorityFilter}
                    onChange={(e) => setTaskPriorityFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold focus:outline-none dark:border-slate-850 dark:bg-darkbg-850"
                  >
                    <option value="ALL">Priority (All)</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                  <select
                    value={taskStatusFilter}
                    onChange={(e) => setTaskStatusFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold focus:outline-none dark:border-slate-850 dark:bg-darkbg-850"
                  >
                    <option value="ALL">Status (All)</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              {filteredActionItems.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No action items fit your search filter parameters.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-850">
                  <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-850 text-left text-sm">
                    <thead className="bg-slate-50/75 dark:bg-darkbg-850 text-slate-500 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Task</th>
                        <th className="px-4 py-3">Assigned To</th>
                        <th className="px-4 py-3">Deadline</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 dark:bg-darkbg-900">
                      {filteredActionItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-darkbg-850/50 transition-colors">
                          <td className="px-4 py-4 flex items-start gap-3 min-w-[200px]">
                            <button 
                              onClick={() => handleToggleActionItemStatus(item.id, item.status)}
                              className="mt-0.5 rounded-full hover:scale-105 transition-transform flex-shrink-0"
                            >
                              {getStatusIcon(item.status)}
                            </button>
                            <span className={item.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-850 dark:text-slate-200'}>
                              {item.task}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-350">{item.assignee || 'Unassigned'}</td>
                          <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">{item.deadline || 'No deadline'}</td>
                          <td className="px-4 py-4">{getPriorityBadge(item.priority)}</td>
                          <td className="px-4 py-4 text-right">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
                              ${item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' : ''}
                              ${item.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400' : ''}
                              ${item.status === 'PENDING' ? 'bg-slate-100 text-slate-700 dark:bg-darkbg-800 dark:text-slate-400' : ''}
                            `}>
                              {item.status?.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          {/* Decisions Sidebar Timeline */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-darkbg-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-amber-500" /> Key Decisions
              </h2>
              
              {!meeting.keyDecisions || meeting.keyDecisions.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">No key decisions extracted.</p>
              ) : (
                <div className="relative border-l-2 border-violet-100 dark:border-slate-800 pl-4 space-y-6">
                  {meeting.keyDecisions.map((decision, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[25px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-white ring-4 ring-white dark:ring-darkbg-900">
                        <span className="text-[8px] font-bold">{idx + 1}</span>
                      </div>
                      
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-darkbg-850 dark:border-slate-800">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {decision}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. TRANSCRIPT TAB */}
      {activeTab === 'transcript' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-darkbg-900 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search within transcript */}
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search text in transcript..."
                value={transcriptSearch}
                onChange={(e) => setTranscriptSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-sm focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-darkbg-850"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button 
                onClick={handleCopyTranscript}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-darkbg-850"
              >
                <Copy className="h-4 w-4" /> Copy
              </button>
              <button 
                onClick={handleDownloadTranscript}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          </div>

          {/* Transcript Viewer */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-6 dark:border-slate-850 dark:bg-darkbg-950 max-h-[500px] overflow-y-auto whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-350 text-sm font-sans">
            {getHighlightedTranscript() || "No transcript content."}
          </div>
        </div>
      )}

      {/* 3. INSIGHTS TAB */}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Topics */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-darkbg-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-indigo-500" /> Topics Discussed
            </h2>
            <div className="space-y-3">
              {meeting.aiInsights?.topics ? (
                meeting.aiInsights.topics.map((topic, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-darkbg-850">
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{topic.name || topic}</span>
                    {topic.duration && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">{topic.duration}</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No structured topics extracted.</p>
              )}
            </div>
          </div>

          {/* Unresolved Issues & Risks */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-darkbg-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-rose-500" /> Risks & Unresolved Issues
            </h2>
            <ul className="space-y-3 list-disc pl-4 text-sm text-slate-700 dark:text-slate-350">
              {meeting.aiInsights?.risks && meeting.aiInsights.risks.length > 0 ? (
                meeting.aiInsights.risks.map((risk, idx) => (
                  <li key={idx} className="leading-relaxed">{risk}</li>
                ))
              ) : (
                <p className="text-sm text-slate-500">No critical risks identified.</p>
              )}
            </ul>
          </div>

          {/* Follow-up suggestions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-darkbg-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-amber-500" /> Follow-up Suggestions
            </h2>
            <ul className="space-y-3 list-disc pl-4 text-sm text-slate-700 dark:text-slate-350">
              {meeting.aiInsights?.followUps && meeting.aiInsights.followUps.length > 0 ? (
                meeting.aiInsights.followUps.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))
              ) : (
                <p className="text-sm text-slate-500">No suggestions generated.</p>
              )}
            </ul>
          </div>

          {/* Sentiment & Tone */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-darkbg-900 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-emerald-500" /> Conversation Tone
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {meeting.aiInsights?.sentiment || "The conversation tone was productive and objective, focusing primarily on design parameters, tasks, and deadlines."}
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span>Collaborative</span>
                <span>Productive</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full dark:bg-darkbg-850">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
