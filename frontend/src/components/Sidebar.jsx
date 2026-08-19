import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  CheckSquare, 
  Settings, 
  Menu, 
  X, 
  Sparkles,
  User
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Meeting', path: '/upload', icon: UploadCloud },
    { name: 'Meetings', path: '/meetings', icon: FileText },
    { name: 'Action Items', path: '/action-items', icon: CheckSquare },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const activeStyle = "flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-600 text-white font-medium shadow-lg shadow-violet-500/20 transition-all duration-200";
  const inactiveStyle = "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-darkbg-800 transition-all duration-200";

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-darkbg-900 md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 shadow-md shadow-violet-600/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-sans text-lg font-bold tracking-tight text-slate-900 dark:text-white">MeetingMind</span>
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-darkbg-800"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed bottom-0 top-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white p-6 transition-transform duration-300 dark:border-slate-800 dark:bg-darkbg-900
        md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="mb-8 hidden items-center gap-3 md:flex">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-600/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-sans text-xl font-black tracking-tight text-slate-900 dark:text-white">MeetingMind</span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-violet-500">AI Intelligence</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="mt-auto border-t border-slate-200 pt-6 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-darkbg-800 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-darkbg-700 text-slate-600 dark:text-slate-300">
              <User className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">Member Pro</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">demo@meetingmind.ai</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
