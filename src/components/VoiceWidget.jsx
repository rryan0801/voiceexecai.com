/**
 * VoiceWidget - Portable Voice UI Component
 * 
 * Drop this into any project to add voice-to-action capability.
 * Fully customizable via config prop.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, RotateCcw, CheckCircle2, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import VoiceCore from '@/lib/voiceCore';

export default function VoiceWidget({ config = {} }) {
  const [phase, setPhase] = useState('idle');
  const [transcription, setTranscription] = useState('');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [showContext, setShowContext] = useState(false);
  const [context, setContext] = useState(config.initialContext || {});

  const voiceCoreRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize VoiceCore
  useEffect(() => {
    voiceCoreRef.current = new VoiceCore({
      clientId: config.clientId,
      context,
      onStatusChange: (newPhase) => setPhase(newPhase),
      onTranscription: (text) => setTranscription(text),
      onResult: (data) => {
        setResult(data);
        if (config.onSuccess) config.onSuccess(data);
      },
      onError: (msg) => {
        setErrorMsg(msg);
        if (config.onError) config.onError(msg);
      }
    });
  }, [config.clientId, context]);

  const startRecording = async () => {
    setSeconds(0);
    setTranscription('');
    setResult(null);
    setErrorMsg('');
    
    await voiceCoreRef.current.startRecording();
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    voiceCoreRef.current.stopRecording();
  };

  const reset = () => {
    voiceCoreRef.current.reset();
    setTranscription('');
    setResult(null);
    setErrorMsg('');
    setSeconds(0);
  };

  // Custom styling
  const buttonBgIdle = config.buttonBgIdle || 'bg-blue-600 hover:bg-blue-500';
  const buttonBgRecording = config.buttonBgRecording || 'bg-red-600 hover:bg-red-500 animate-pulse';
  const buttonSize = config.buttonSize || 'w-28 h-28';
  const containerBg = config.containerBg || 'bg-gradient-to-b from-slate-900 to-slate-800';

  return (
    <div className={`min-h-screen ${containerBg} flex flex-col items-center justify-between p-6 pt-12 pb-10`}>
      {/* Header */}
      {config.showHeader !== false && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">{config.title || 'Voice Command'}</h1>
          <p className="text-slate-400 text-sm mt-1">{config.subtitle || 'Speak your action'}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Status Display */}
        {(phase === 'processing' || phase === 'done') && config.showStatus !== false && (
          <div className="w-full bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
            <div className="space-y-2 text-sm text-slate-300">
              <p>Status: <span className="font-semibold capitalize">{phase}</span></p>
              {transcription && (
                <p className="text-xs italic text-slate-400">"{transcription}"</p>
              )}
            </div>
          </div>
        )}

        {/* Mic Button */}
        {(phase === 'idle' || phase === 'recording') && (
          <div className="flex flex-col items-center gap-4">
            {phase === 'recording' && config.showTimer !== false && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 font-mono text-sm">
                  {String(Math.floor(seconds / 60)).padStart(2, '0')}:
                  {String(seconds % 60).padStart(2, '0')}
                </span>
              </div>
            )}
            <button
              onClick={phase === 'idle' ? startRecording : stopRecording}
              className={cn(
                `${buttonSize} rounded-full flex items-center justify-center transition-all shadow-2xl`,
                phase === 'idle' ? buttonBgIdle : buttonBgRecording
              )}
            >
              {phase === 'idle'
                ? <Mic className="w-12 h-12 text-white" />
                : <Square className="w-10 h-10 text-white fill-white" />
              }
            </button>
            <p className="text-slate-400 text-sm">
              {phase === 'idle' ? 'Tap to record' : 'Tap to stop'}
            </p>
          </div>
        )}

        {phase === 'processing' && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
            <p className="text-slate-300 text-sm">Processing...</p>
          </div>
        )}

        {phase === 'done' && result && (
          <div className="w-full bg-green-900/30 border border-green-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-semibold">
                {result.summary || result.result?.summary || 'Done!'}
              </span>
            </div>
            <button
              onClick={reset}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 text-sm flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> New Command
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div className="w-full bg-red-900/30 border border-red-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300 font-semibold">Error</span>
            </div>
            <p className="text-slate-300 text-sm">{errorMsg}</p>
            <button
              onClick={reset}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 text-sm flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}

        {/* Context Inputs */}
        {phase === 'idle' && config.contextFields && config.contextFields.length > 0 && (
          <div className="w-full">
            <button
              onClick={() => setShowContext(!showContext)}
              className="flex items-center gap-2 text-slate-400 text-sm mb-3"
            >
              <ChevronDown className={cn('w-4 h-4 transition-transform', showContext && 'rotate-180')} />
              Add context (optional)
            </button>
            {showContext && (
              <div className="space-y-2">
                {config.contextFields.map((field) => (
                  <input
                    key={field.name}
                    value={context[field.name] || ''}
                    onChange={(e) => setContext({ ...context, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {config.showFooter !== false && (
        <p className="text-slate-600 text-xs">{config.footer || 'Powered by VoiceExec'}</p>
      )}
    </div>
  );
}