import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingService } from '../services/api';
import { 
  Upload, 
  FileAudio, 
  X, 
  Sparkles, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  Play,
  Settings,
  AlertCircle
} from 'lucide-react';

export default function UploadMeeting() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Processing state
  const [processingMeetingId, setProcessingMeetingId] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null); // 'TRANSCRIBING', 'ANALYZING', etc.
  const [errorMessage, setErrorMessage] = useState(null);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Polling logic when processing
  useEffect(() => {
    let intervalId;
    if (processingMeetingId) {
      intervalId = setInterval(() => {
        meetingService.getMeeting(processingMeetingId)
          .then(res => {
            const meeting = res.data;
            setProcessingStatus(meeting.status);
            
            if (meeting.status === 'COMPLETED') {
              clearInterval(intervalId);
              // Navigate to details page
              setTimeout(() => {
                navigate(`/meetings/${meeting.id}`);
              }, 1000);
            } else if (meeting.status === 'FAILED') {
              clearInterval(intervalId);
              setErrorMessage("ASR transcription or LLM summarization pipeline failed. Please check your API keys and audio file format.");
              setIsUploading(false);
              setProcessingMeetingId(null);
            }
          })
          .catch(err => {
            console.error("Error polling meeting status:", err);
            clearInterval(intervalId);
            setErrorMessage("Connection to server lost while processing.");
            setIsUploading(false);
            setProcessingMeetingId(null);
          });
      }, 2500);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [processingMeetingId, navigate]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('audio/') || droppedFile.name.endsWith('.mp3') || droppedFile.name.endsWith('.wav') || droppedFile.name.endsWith('.m4a')) {
        setFile(droppedFile);
        if (!title) {
          // Pre-populate title with file name minus extension
          setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
        }
      } else {
        setErrorMessage("Unsupported file type. Please upload an audio file (MP3, WAV, M4A).");
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setTitle('');
    setUploadProgress(0);
    setErrorMessage(null);
  };

  const handleStartProcessing = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorMessage(null);
    setUploadProgress(0);
    setProcessingStatus('UPLOADING');

    try {
      const response = await meetingService.uploadMeeting(
        file, 
        title, 
        (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
          if (progress === 100) {
            setProcessingStatus('TRANSCRIBING');
          }
        }
      );
      
      const createdMeeting = response.data;
      setProcessingMeetingId(createdMeeting.id);
      setProcessingStatus(createdMeeting.status);
    } catch (err) {
      console.error("Upload failed:", err);
      setErrorMessage(err.response?.data?.message || "Failed to upload file to the backend server. Make sure file size doesn't exceed Spring Boot's multipart maximum configuration (default 10MB/50MB).");
      setIsUploading(false);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Get status steps styles
  const getStepStatus = (stepName) => {
    const steps = ['UPLOADING', 'TRANSCRIBING', 'ANALYZING', 'COMPLETED'];
    const currentIdx = steps.indexOf(processingStatus);
    const stepIdx = steps.indexOf(stepName);

    if (currentIdx > stepIdx) return 'completed';
    if (currentIdx === stepIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Upload Meeting Audio</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Add an audio recording to transcribe, summarize, and extract action items.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-850 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Processing Error</h4>
            <p className="text-xs opacity-90 mt-0.5">{errorMessage}</p>
          </div>
          <button 
            onClick={() => setErrorMessage(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-darkbg-900">
        
        {/* Processing Mode */}
        {isUploading ? (
          <div className="py-8 text-center space-y-8">
            <div className="max-w-md mx-auto space-y-3">
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                {processingStatus === 'UPLOADING' && `Uploading: ${uploadProgress}%`}
                {processingStatus === 'TRANSCRIBING' && "Transcribing Audio..."}
                {processingStatus === 'ANALYZING' && "Analyzing Transcript..."}
                {processingStatus === 'COMPLETED' && "Finalizing meeting intelligence..."}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {processingStatus === 'UPLOADING' && "Sending meeting voice file to server..."}
                {processingStatus === 'TRANSCRIBING' && "Whisper ASR is mapping voice signals to text segments..."}
                {processingStatus === 'ANALYZING' && "LLM engine is analyzing conversation context, decisions, and tasks..."}
                {processingStatus === 'COMPLETED' && "Structuring records inside MongoDB."}
              </p>
            </div>

            {/* Visual Progress Steps */}
            <div className="relative max-w-lg mx-auto py-8">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-[5%] right-[5%] h-1 bg-slate-100 dark:bg-darkbg-800 -translate-y-1/2 -z-10" />
              
              <div className="flex justify-between">
                {[
                  { id: 'UPLOADING', label: 'Upload' },
                  { id: 'TRANSCRIBING', label: 'Transcribe' },
                  { id: 'ANALYZING', label: 'Analyze' },
                  { id: 'COMPLETED', label: 'Finished' }
                ].map((step, idx) => {
                  const status = getStepStatus(step.id);
                  return (
                    <div key={step.id} className="flex flex-col items-center space-y-2">
                      <div className={`
                        flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300
                        ${status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                        ${status === 'active' ? 'bg-violet-600 border-violet-600 text-white ring-4 ring-violet-500/20 shadow-md shadow-violet-600/30' : ''}
                        ${status === 'pending' ? 'bg-white border-slate-200 text-slate-400 dark:bg-darkbg-900 dark:border-slate-800' : ''}
                      `}>
                        {status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                      </div>
                      <span className={`text-xs font-semibold ${status === 'active' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spinner or Loader */}
            <div className="flex justify-center">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-darkbg-800 rounded-xl px-5 py-3 text-sm text-slate-600 dark:text-slate-300">
                <Loader2 className="h-5 w-5 text-violet-600 animate-spin" />
                <span>Our AI nodes are processing your request. Please do not close this window.</span>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Upload Form */
          <div className="space-y-6">
            
            {/* Input title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Meeting Title
              </label>
              <input 
                id="title"
                type="text"
                placeholder="e.g. Project Sprint Planning, Client sync..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-slate-800 dark:bg-darkbg-800 dark:text-white"
              />
            </div>

            {/* Drag & Drop Area */}
            {!file ? (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`
                  flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
                  ${dragActive ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/10' : 'border-slate-250 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-darkbg-950 dark:hover:bg-darkbg-900'}
                `}
                onClick={onButtonClick}
              >
                <input 
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a"
                  onChange={handleChange}
                  className="hidden"
                />
                
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 mb-4 border border-violet-100 dark:border-violet-900/50">
                  <Upload className="h-7 w-7" />
                </div>
                
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Drag & drop your meeting audio</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Supports MP3, WAV, or M4A audio formats. File sizes up to 50MB.
                </p>
                <button 
                  type="button"
                  className="mt-6 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 transition-colors"
                >
                  Browse Files
                </button>
              </div>
            ) : (
              /* File Loaded View */
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-darkbg-950 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 flex-shrink-0">
                    <FileAudio className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatBytes(file.size)}</p>
                  </div>
                </div>

                <button 
                  onClick={handleRemoveFile}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-darkbg-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Bottom CTA buttons */}
            {file && (
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={handleRemoveFile}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-darkbg-950 dark:text-slate-300 dark:hover:bg-darkbg-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleStartProcessing}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-500 transition-all duration-200"
                >
                  Start Processing <Play className="h-4 w-4 fill-current" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
