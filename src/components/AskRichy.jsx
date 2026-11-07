import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function visitorId() {
  try {
    let id = localStorage.getItem('ask_richy_vid');
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));
      localStorage.setItem('ask_richy_vid', id);
    }
    return id;
  } catch (_e) {
    return '';
  }
}

// "Ask Richy" AI assistant button, shown on every page (mounted once in App.jsx).
export default function AskRichy() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [msgs, setMsgs] = useState([]);
  const [busy, setBusy] = useState(false);

  const ask = async (e) => {
    e?.preventDefault();
    const question = q.trim();
    if (!question || busy) return;
    setMsgs((m) => [...m, { from: 'you', text: question }]);
    setQ('');
    setBusy(true);
    try {
      const res = await base44.functions.invoke('askRichy', { question, visitor_id: visitorId() });
      setMsgs((m) => [...m, { from: 'ai', text: res.data?.answer || 'Sorry, I could not answer that.' }]);
    } catch (_e) {
      setMsgs((m) => [...m, { from: 'ai', text: 'Sorry, Ask Richy is not available right now. Please email richy@voiceexecai.com.' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl text-sm font-semibold"
          aria-label="Ask Richy, an AI assistant"
        >
          <MessageCircle className="w-4 h-4" /> Ask Richy (AI)
        </button>
      )}
      {open && (
        <div className="fixed bottom-5 right-5 z-[60] w-[min(92vw,360px)] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[70vh]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div>
              <p className="font-semibold text-slate-900 text-sm">Ask Richy</p>
              <p className="text-[11px] text-slate-500">An AI assistant. It can make mistakes. No medical, legal or financial advice.</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-slate-100" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
            {msgs.length === 0 && (
              <p className="text-slate-500">Hi! I am an AI assistant. Ask me about VoiceExecAI, its plans, or a general question.</p>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={m.from === 'you' ? 'text-right' : ''}>
                <span className={`inline-block px-3 py-2 rounded-xl whitespace-pre-wrap ${m.from === 'you' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>{m.text}</span>
              </div>
            ))}
            {busy && <p className="text-slate-400">Thinking...</p>}
          </div>
          <form onSubmit={ask} className="flex gap-2 p-3 border-t border-slate-100">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              maxLength={800}
              placeholder="Type your question"
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
            <button type="submit" disabled={busy} className="px-3 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60" aria-label="Send">
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 px-4 pb-2">About 20 questions a day. Your questions are not saved.</p>
        </div>
      )}
    </>
  );
}
