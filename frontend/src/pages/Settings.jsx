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
    asrProvider: 'openai-whisper',
    asrModel: 'whisper-large-v3',
    summaryProvider: 'groq',
    evaluationFocus: 'Summary Quality',
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Title with theme switcher in top right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm">
            Configure ASR provider models, AI summarization models, and API configurations.
          </p>
        </div>
        <button 
          onClick={toggleTheme}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="self-start sm:self-auto rounded-xl border border-slate-200 p-2.5 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-darkbg-900 dark:hover:bg-darkbg-850 hover:shadow-sm transition-all duration-200"
        >
          {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-600" />}
        </button>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-darkbg-900 space-y-6">
        
        {statusMsg && (
          <div className={`flex items-center gap-3 rounded-xl border p-4 text-sm
            ${statusMsg.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/30 dark:bg-red-950/20'}`}
          >
            {statusMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" /> : <XCircle className="h-5 w-5 flex-shrink-0" />}
            <p className="font-semibold">{statusMsg.text}</p>
          </div>
        )}

        {/* ASR Provider Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
            <Radio className="h-4 w-4 text-violet-500" /> Speech-To-Text (ASR) Provider
          </label>
          <select
            value={settings.asrProvider}
            onChange={(e) => handleChange('asrProvider', e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white text-slate-900 dark:border-slate-800 dark:bg-darkbg-850 dark:text-white"
          >
            <option value="openai-whisper">Active API Integration (OpenAI / Groq Compatible)</option>
          </select>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Connects directly to the endpoint configured below to transcribe your audio recording dynamically.
          </p>
        </div>

        {/* ASR Model */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
            <Radio className="h-4 w-4 text-emerald-500" /> ASR Model Name
          </label>
          <select
            value={settings.asrModel || 'whisper-large-v3'}
            onChange={(e) => {
              if (e.target.value !== 'whisper-1') handleChange('asrModel', e.target.value);
            }}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white text-slate-900 dark:border-slate-800 dark:bg-darkbg-850 dark:text-white"
          >
            <option value="whisper-large-v3">✅ whisper-large-v3 — Groq (Free)</option>
            <option value="whisper-1" disabled style={{color:'#9ca3af'}}>🔒 whisper-1 — OpenAI (Paid Only, not selectable)</option>
          </select>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Only <code>whisper-large-v3</code> via Groq is available for free use. <span className="text-amber-500 font-semibold">whisper-1 requires a paid OpenAI account.</span>
          </p>
        </div>

        {/* Evaluation Focus */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
            <Radio className="h-4 w-4 text-indigo-500" /> Evaluation Focus
          </label>
          <select
            value={settings.evaluationFocus || 'Summary Quality'}
            onChange={(e) => handleChange('evaluationFocus', e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white text-slate-900 dark:border-slate-800 dark:bg-darkbg-850 dark:text-white"
          >
            <option value="Summary Quality">Summary Quality</option>
            <option value="Transcription Accuracy">Transcription Accuracy</option>
            <option value="Action Item Accuracy">Action Item Accuracy</option>
            <option value="Decision Accuracy">Decision Accuracy</option>
            <option value="Factuality">Factuality</option>
            <option value="Overall Quality">Overall Quality</option>
          </select>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select the primary focus area for evaluating the meeting intelligence output.
          </p>
        </div>

        {/* AI Provider for Summary */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-violet-500" /> AI Provider for Summary
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Groq Card */}
            <label className={`cursor-pointer rounded-xl border p-4 flex flex-col justify-between transition-all duration-200 ${
              settings.summaryProvider === 'groq' 
                ? 'border-violet-600 bg-violet-50/50 dark:border-violet-500 dark:bg-violet-950/20' 
                : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-850 dark:bg-darkbg-850'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Groq</span>
                <input 
                  type="radio" 
                  name="summaryProvider" 
                  value="groq" 
                  checked={settings.summaryProvider === 'groq'}
                  onChange={() => handleChange('summaryProvider', 'groq')}
                  className="text-violet-600 focus:ring-violet-500 h-4 w-4"
                />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Llama 3.3 70B</span>
              <span className="text-xs font-semibold text-emerald-600 mt-2">FREE Tier</span>
            </label>

            {/* Gemini Card */}
            <label className={`cursor-pointer rounded-xl border p-4 flex flex-col justify-between transition-all duration-200 ${
              settings.summaryProvider === 'gemini' 
                ? 'border-violet-600 bg-violet-50/50 dark:border-violet-500 dark:bg-violet-950/20' 
                : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-850 dark:bg-darkbg-850'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Google Gemini</span>
                <input 
                  type="radio" 
                  name="summaryProvider" 
                  value="gemini" 
                  checked={settings.summaryProvider === 'gemini'}
                  onChange={() => handleChange('summaryProvider', 'gemini')}
                  className="text-violet-600 focus:ring-violet-500 h-4 w-4"
                />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Gemini 2.5 Flash</span>
              <span className="text-xs font-semibold text-emerald-600 mt-2">FREE Tier</span>
            </label>

            {/* Custom Card */}
            <label className={`cursor-pointer rounded-xl border p-4 flex flex-col justify-between transition-all duration-200 ${
              settings.summaryProvider === 'custom' 
                ? 'border-violet-600 bg-violet-50/50 dark:border-violet-500 dark:bg-violet-950/20' 
                : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-850 dark:bg-darkbg-850'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Custom Endpoint</span>
                <input 
                  type="radio" 
                  name="summaryProvider" 
                  value="custom" 
                  checked={settings.summaryProvider === 'custom'}
                  onChange={() => handleChange('summaryProvider', 'custom')}
                  className="text-violet-600 focus:ring-violet-500 h-4 w-4"
                />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Custom Base URL/Key</span>
              <span className="text-xs font-semibold text-amber-600 mt-2">OpenAI Compatible</span>
            </label>
          </div>
        </div>

        {settings.summaryProvider === 'custom' && (
          <>
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
                <optgroup label="✅ Free — Groq (Verified Working)">
                  <option value="openai/gpt-oss-20b">openai/gpt-oss-20b — Fast &amp; Free (Recommended)</option>
                  <option value="openai/gpt-oss-120b">openai/gpt-oss-120b — High Quality &amp; Free</option>
                  <option value="qwen/qwen3.6-27b">qwen/qwen3.6-27b — Alternative Free Model</option>
                </optgroup>
                <optgroup label="🔒 Paid Only — OpenAI (Not selectable)">
                  <option value="gpt-4o-mini" disabled style={{color:'#9ca3af'}}>gpt-4o-mini — Requires paid OpenAI key</option>
                  <option value="gpt-4o" disabled style={{color:'#9ca3af'}}>gpt-4o — Requires paid OpenAI key</option>
                </optgroup>
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Free Groq models are verified working. <span className="text-amber-500 font-semibold">OpenAI models require a paid API subscription.</span>
              </p>
            </div>
          </>
        )}

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
  );
}
