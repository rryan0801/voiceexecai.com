import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Mic, Square, Send, RotateCcw, CheckCircle2, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import CommandStatusTracker from '@/components/CommandStatusTracker';

export default function MobileWidget() {
  const [phase, setPhase] = useState('idle'); // idle, recording, processing, done, error
  const [commandStatus, setCommandStatus] = useState('pending');
  const [transcription, setTranscription] = useState('');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [prospectName, setProspectName] = useState('');
  const [company, setCompany] = useState('');
  const [showContext, setShowContext] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const clientRef = useRef(null);

  // Load first active client
  useEffect(() => {
    base44.entities.Client.filter({ status: 'active' }, '-created_date', 1).then(clients => {
      if (clients.length > 0) clientRef.current = clients[0];
    });
  }, []);

  const startRecording = async () => {
    chunksRef.current = [];
    setSeconds(0);
    setTranscription('');
    setResult(null);
    setErrorMsg('');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    mediaRecorderRef.current = mr;
    mr.ondataavailable = e => chunksRef.current.push(e.data);
    mr.onstop = handleStop;
    mr.start();
    startTimeRef.current = Date.now();
    setPhase('recording');
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop());
  };

  const handleStop = async () => {
    setPhase('processing');
    setCommandStatus('transcribing');

    const client = clientRef.current;
    if (!client) {
      setErrorMsg('No active client found. Create one in the Dashboard first.');
      setPhase('error');
      return;
    }

    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', audioBlob);

    // Upload audio
    const uploadRes = await base44.functions.invoke('uploadAudio', formData);
    if (!uploadRes.data?.audio_url) {
      setErrorMsg('Audio upload failed. Please try again.');
      setPhase('error');
      return;
    }

    const { audio_url } = uploadRes.data;
    const context = { prospect_name: prospectName, prospect_company: company };

    // Create command
    const createRes = await base44.functions.invoke('createCommand', {
      client_id: client.id, audio_url, context
    });
    const command_id = createRes.data?.command_id;

    // Transcribe
    setCommandStatus('transcribing');
    const transcribeRes = await base44.functions.invoke('transcribeAudioStream', {
      audio_url, command_id
    });

    if (transcribeRes.data?.error) {
      setErrorMsg(transcribeRes.data.user_message || transcribeRes.data.error);
      setPhase('error');
      return;
    }

    const { transcription: text } = transcribeRes.data;
    setTranscription(text);
    setCommandStatus('reasoning');

    // Execute
    setCommandStatus('executing');
    const execRes = await base44.functions.invoke('executeVoiceCommandStream', {
      client_id: client.id, command_id, transcription: text, context
    });

    if (execRes.data?.error) {
      setErrorMsg(execRes.data.user_message || execRes.data.error);
      setPhase('error');
      return;
    }

    setResult(execRes.data?.result);
    setCommandStatus('completed');
    setPhase('done');
  };

  const reset = () => {
    setPhase('idle');
    setCommandStatus('pending');
    setTranscription('');
    setResult(null);
    setErrorMsg('');
    setSeconds(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-between p-6 pt-12 pb-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">VoiceRep AI</h1>
        <p className="text-slate-400 text-sm mt-1">Speak your sales action</p>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Status Tracker */}
        {(phase === 'processing' || phase === 'done') && (
          <div className="w-full bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
            <CommandStatusTracker status={commandStatus} />
          </div>
        )}

        {/* Mic Button */}
        {(phase === 'idle' || phase === 'recording') && (
          <div className="flex flex-col items-center gap-4">
            {phase === 'recording' && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 font-mono text-sm">{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</span>
              </div>
            )}
            <button
              onClick={phase === 'idle' ? startRecording : stopRecording}
              className={cn(
                'w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-2xl',
                phase === 'idle'
                  ? 'bg-blue-600 hover:bg-blue-500 active:scale-95'
                  : 'bg-red-600 hover:bg-red-500 animate-pulse'
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
            <p className="text-slate-300 text-sm">Processing your command...</p>
          </div>
        )}

        {phase === 'done' && result && (
          <div className="w-full bg-green-900/30 border border-green-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-semibold">{result.summary || 'Done!'}</span>
            </div>
            {transcription && (
              <p className="text-slate-400 text-xs italic">"{transcription}"</p>
            )}
            {result.warnings?.map((w, i) => (
              <p key={i} className="text-amber-400 text-xs">{w}</p>
            ))}
            <button onClick={reset} className="w-full mt-2 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 text-sm flex items-center justify-center gap-2">
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
            <button onClick={reset} className="w-full mt-2 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 text-sm flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}

        {/* Context inputs */}
        {phase === 'idle' && (
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
                <input
                  value={prospectName}
                  onChange={e => setProspectName(e.target.value)}
                  placeholder="Prospect name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500"
                />
                <input
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Company"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-slate-600 text-xs">VoiceRep AI • Sales Rep Edition</p>
    </div>
  );
}