import React, { useEffect, useState } from 'react';
import { systemService } from '../services/api';
import { 
  Settings as SettingsIcon, 
  Key, 
  Cpu, 
  Radio, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  AlertTriangle,
  Moon,
  Sun,
  ShieldCheck
} from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    openaiApiKey: '',
    openaiBaseUrl: 'https://api.openai.com/v1',
    llmModel: 'gpt-4o-mini',
    asrProvider: 'openai-whisper', // options: openai-whisper, mock
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  
  // Connection diagnostics
  const [backendConnected, setBackendConnected] = useState(null);
  const [checkingConnection, setCheckingConnection] = useState(false);

  // Theme states
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load current dark mode from html class
    setDarkMode(document.documentElement.classList.contains('dark'));
    
    // Load backend system settings
    systemService.getSettings()
      .then(res => {
        if (res.data) {
          setSettings(prev => ({
            ...prev,
            ...res.data,
            // Mask API key for security in display
            openaiApiKey: res.data.openaiApiKey ? '••••••••••••••••••••••••' : ''
          }));
        }
        setBackendConnected(true);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load settings:", err);
        setBackendConnected(false);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      await systemService.saveSettings(settings);
      setStatusMsg({ type: 'success', text: 'Settings saved successfully to backend MongoDB storage!' });
    } catch (err) {
      console.error("Save settings error:", err);
      setStatusMsg({ type: 'error', text: 'Failed to write configurations to the server.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = () => {
    setCheckingConnection(true);
    systemService.getSettings()
      .then(() => {
        setBackendConnected(true);
        setCheckingConnection(false);
      })
      .catch(() => {
        setBackendConnected(false);
        setCheckingConnection(false);
      });
  };

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const handleChange = (key, val) => {
    setSettings({
      ...settings,
      [key]: val
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-200 dark:bg-darkbg-800 rounded animate-pulse" />
        <div className="h-96 bg-slate-200 dark:bg-darkbg-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Configure API connection endpoints, LLM model sizes, and customize app preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Preferences */}
        <div className="space-y-6">
          {/* Connection Diagnostics Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-darkbg-900">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Diagnostics</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Server Connectivity</span>
                {checkingConnection ? (
                  <Loader2 className="h-5 w-5 text-violet-600 animate-spin" />
                ) : backendConnected ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                    <XCircle className="h-4 w-4" /> Offline
                  </span>
                )}
              </div>

              <button 
                onClick={handleTestConnection}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold hover:bg-slate-100 dark:border-slate-800 dark:bg-darkbg-850 dark:hover:bg-darkbg-800"
              >
                Ping Server
              </button>
            </div>
          </div>

          {/* Theme Preferences */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-darkbg-900">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Aesthetics</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Dark Mode</span>
              <button 
                onClick={toggleTheme}
                className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-darkbg-800 transition-colors"
              >
                {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-darkbg-900 space-y-6">
            
            {statusMsg && (
              <div className={`flex items-center gap-3 rounded-xl border p-4 text-sm
                ${statusMsg.type === 'success' ? 'border-emerald-250 bg-emerald-50 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/30 dark:bg-red-950/20'}`}
              >
                {statusMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" /> : <XCircle className="h-5 w-5 flex-shrink-0" />}
                <p className="font-semibold">{statusMsg.text}</p>
              </div>
            )}

            {/* ASR Provider Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
                <Radio className="h-4 w-4 text-violet-500" /> Speech-To-Text (ASR) Config
              </label>
              <select
                value={settings.asrProvider}
                onChange={(e) => handleChange('asrProvider', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white text-slate-900 dark:border-slate-800 dark:bg-darkbg-850 dark:text-white"
              >
                <option value="openai-whisper">OpenAI Whisper (Requires API Key)</option>
                <option value="mock">Demo Mode (Local preset-based mock generation)</option>
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Demo mode doesn't connect to OpenAI endpoints. Instead, it simulates transcription processing on upload.
              </p>
            </div>

            {/* API URL Configuration */}
            <div className="space-y-2">
              <label htmlFor="baseUrl" className="text-sm font-semibold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-indigo-500" /> OpenAI-Compatible Base URL
              </label>
              <input 
                id="baseUrl"
                type="text"
                value={settings.openaiBaseUrl}
                onChange={(e) => handleChange('openaiBaseUrl', e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white text-slate-900 dark:border-slate-800 dark:bg-darkbg-850 dark:text-white"
              />
            </div>

            {/* API Key Input */}
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-semibold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                <Key className="h-4 w-4 text-violet-500" /> API Authentication Key
              </label>
              <input 
                id="apiKey"
                type="password"
                value={settings.openaiApiKey}
                onChange={(e) => handleChange('openaiApiKey', e.target.value)}
                placeholder="sk-..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white text-slate-900 dark:border-slate-800 dark:bg-darkbg-850 dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Leave empty to retain previously stored backend credentials or environment variables.
              </p>
            </div>

            {/* LLM Model Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-emerald-500" /> Summarizer LLM Model
              </label>
              <select
                value={settings.llmModel}
                onChange={(e) => handleChange('llmModel', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white text-slate-900 dark:border-slate-800 dark:bg-darkbg-850 dark:text-white"
              >
                <option value="gpt-4o-mini">gpt-4o-mini (Cost-efficient, recommended)</option>
                <option value="gpt-4o">gpt-4o (High reasoning quality)</option>
                <option value="o1-mini">o1-mini (Advanced logical reasoning)</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-500 disabled:opacity-50 transition-all duration-200"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" /> Save Configuration
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
