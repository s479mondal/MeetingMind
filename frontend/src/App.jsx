import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import UploadMeeting from './pages/UploadMeeting';
import MeetingHistory from './pages/MeetingHistory';
import MeetingDetail from './pages/MeetingDetail';
import ActionItemsPage from './pages/ActionItemsPage';
import Settings from './pages/Settings';

// Layout wrapper for all pages except Landing Page
function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-darkbg-950 dark:text-slate-100 transition-colors duration-200">
      <Sidebar />
      <main className="md:pl-64 p-6 min-h-screen">
        <div className="mx-auto max-w-6xl py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // Check local storage for dark mode on startup
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing/marketing page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Main Application Routes inside layout wrapper */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadMeeting />} />
          <Route path="/meetings" element={<MeetingHistory />} />
          <Route path="/meetings/:id" element={<MeetingDetail />} />
          <Route path="/action-items" element={<ActionItemsPage />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
