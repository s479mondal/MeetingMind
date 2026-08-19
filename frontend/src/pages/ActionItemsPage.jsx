import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { meetingService, actionItemService } from '../services/api';
import { 
  CheckSquare, 
  Search, 
  ArrowRight, 
  CheckCircle, 
  Clock3, 
  Circle, 
  Calendar,
  AlertCircle,
  Briefcase
} from 'lucide-react';

export default function ActionItemsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

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
        console.error("Failed to load meetings for tasks:", err);
        setError("Could not retrieve task data from backend.");
        setLoading(false);
      });
  };

  const handleToggleStatus = async (meetingId, itemId, currentStatus) => {
    let nextStatus = 'PENDING';
    if (currentStatus === 'PENDING') nextStatus = 'IN_PROGRESS';
    else if (currentStatus === 'IN_PROGRESS') nextStatus = 'COMPLETED';
    else nextStatus = 'PENDING';

    try {
      await actionItemService.updateActionItem(meetingId, itemId, { status: nextStatus });
      // Update local state
      setMeetings(prevMeetings => 
        prevMeetings.map(m => {
          if (m.id === meetingId) {
            return {
              ...m,
              actionItems: m.actionItems.map(item => 
                item.id === itemId ? { ...item, status: nextStatus } : item
              )
            };
          }
          return m;
        })
      );
    } catch (err) {
      console.error("Failed to toggle status globally:", err);
      alert("Error updating status.");
    }
  };

  // Compile all tasks
  const allTasks = [];
  meetings.forEach(meeting => {
    if (meeting.actionItems) {
      meeting.actionItems.forEach(item => {
        allTasks.push({
          ...item,
          meetingId: meeting.id,
          meetingTitle: meeting.title
        });
      });
    }
  });

  // Filter tasks
  const filteredTasks = allTasks.filter(task => {
    const textMatch = task.task?.toLowerCase().includes(search.toLowerCase()) || 
                      task.assignee?.toLowerCase().includes(search.toLowerCase()) ||
                      task.meetingTitle?.toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === 'ALL' || task.status === statusFilter;
    const priorityMatch = priorityFilter === 'ALL' || task.priority === priorityFilter;
    return textMatch && statusMatch && priorityMatch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-emerald-500 fill-emerald-50 dark:fill-transparent" />;
      case 'IN_PROGRESS':
        return <Clock3 className="h-5 w-5 text-amber-500" />;
      case 'PENDING':
      default:
        return <Circle className="h-5 w-5 text-slate-300 dark:text-slate-650" />;
    }
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

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Central Action Center</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review and execute tasks aggregated across all recorded meetings.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900/30 dark:bg-red-950/20">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Toolbar / Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white dark:bg-darkbg-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search tasks, assignees, or meetings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-11 pr-4 py-2.5 bg-white text-slate-900 focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-darkbg-850 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-darkbg-850 dark:text-white"
          >
            <option value="ALL">Status (All)</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-darkbg-850 dark:text-white"
          >
            <option value="ALL">Priority (All)</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Action Items List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-xl bg-slate-200 dark:bg-darkbg-800 animate-pulse" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-850 p-12 text-center max-w-lg mx-auto">
          <CheckSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-slate-850 dark:text-white">No tasks matching filters</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            There are no active action items found. Upload meetings and let AI extract tasks for you!
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-darkbg-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
              <thead className="bg-slate-50 dark:bg-darkbg-850 text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Task Description</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Source Meeting</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800 bg-white dark:bg-darkbg-900">
                {filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-darkbg-850/50 transition-colors">
                    <td className="px-6 py-5 flex items-start gap-3 min-w-[280px]">
                      <button 
                        onClick={() => handleToggleStatus(task.meetingId, task.id, task.status)}
                        className="mt-0.5 rounded-full hover:scale-105 transition-transform flex-shrink-0"
                      >
                        {getStatusIcon(task.status)}
                      </button>
                      <span className={task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'font-medium text-slate-900 dark:text-slate-200'}>
                        {task.task}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-semibold text-slate-700 dark:text-slate-350">{task.assignee || 'Unassigned'}</td>
                    <td className="px-6 py-5">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {task.deadline || 'No deadline'}
                      </span>
                    </td>
                    <td className="px-6 py-5">{getPriorityBadge(task.priority)}</td>
                    <td className="px-6 py-5 min-w-[180px]">
                      <Link 
                        to={`/meetings/${task.meetingId}`}
                        className="text-xs text-violet-600 hover:text-violet-500 font-semibold dark:text-violet-400 dark:hover:text-violet-300 flex items-center gap-1"
                      >
                        <Briefcase className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[140px]">{task.meetingTitle}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider
                        ${task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-850 dark:bg-emerald-950/20 dark:text-emerald-400' : ''}
                        ${task.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-850 dark:bg-amber-950/20 dark:text-amber-400' : ''}
                        ${task.status === 'PENDING' ? 'bg-slate-100 text-slate-700 dark:bg-darkbg-800 dark:text-slate-400' : ''}
                      `}>
                        {task.status?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
