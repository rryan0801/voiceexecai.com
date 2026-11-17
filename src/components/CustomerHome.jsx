import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle, History, Users, Info } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import NavBar from '@/components/NavBar';
import VoiceWidget from '@/components/VoiceWidget';
import useMyWorkspace from '@/lib/useMyWorkspace';

// What a paying customer sees at /dashboard: the voice assistant itself, plus their
// follow-up task list. (The admin console stays admin-only in Dashboard.jsx.)
const EXAMPLES = [
  '"Email John at TechCorp a thank-you for today\'s demo."',
  '"Set up a 30-minute call with Sarah next Tuesday at 10am."',
  '"Remind me to follow up with BlueSky on Friday."',
  '"Draft a proposal for Acme Corp."',
];

function TaskList() {
  const qc = useQueryClient();
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 50),
    initialData: [],
  });

  const toggle = async (t) => {
    await base44.entities.Task.update(t.id, { status: t.status === 'completed' ? 'pending' : 'completed' });
    qc.invalidateQueries({ queryKey: ['my-tasks'] });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Your follow-up tasks</h2>
        <button onClick={() => qc.invalidateQueries({ queryKey: ['my-tasks'] })} className="text-xs text-blue-600 underline">Refresh</button>
      </div>
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-slate-500">No tasks yet. Say something like "Remind me to call Acme on Friday."</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-start gap-3">
              <button onClick={() => toggle(t)} aria-label={t.status === 'completed' ? 'Mark not done' : 'Mark done'} className="mt-0.5">
                {t.status === 'completed'
                  ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                  : <Circle className="w-5 h-5 text-slate-400" />}
              </button>
              <div className={t.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}>
                <p className="text-sm font-medium">{t.title}</p>
                {t.due_date && <p className="text-xs text-slate-500">Due {new Date(t.due_date).toLocaleString()}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CustomerHome() {
  const { loading, clientId, error } = useMyWorkspace();
  const qc = useQueryClient();

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900">Your voice assistant</h1>
        <p className="text-slate-500 mt-1 mb-6">Tap the mic, say what you need, then tap again to stop. You get a draft to check and use.</p>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            {loading ? (
              <div className="rounded-2xl bg-slate-900 text-white p-10 text-center">Setting up your workspace...</div>
            ) : error ? (
              <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 p-6 text-sm">{error}</div>
            ) : (
              <VoiceWidget
                config={{
                  clientId,
                  compact: true,
                  title: 'VoiceExecAI',
                  subtitle: 'Say your sales follow-up',
                  contextFields: [
                    { name: 'prospect_name', placeholder: 'Prospect name (optional)' },
                    { name: 'prospect_company', placeholder: 'Company (optional)' },
                  ],
                  onSuccess: () => qc.invalidateQueries({ queryKey: ['my-tasks'] }),
                }}
              />
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Things you can say</h2>
              <ul className="space-y-2 text-sm text-slate-700">
                {EXAMPLES.map((e) => <li key={e}>{e}</li>)}
              </ul>
              <div className="mt-4 flex gap-2 text-xs text-slate-500">
                <Info className="w-4 h-4 flex-shrink-0" />
                <p>VoiceExecAI drafts emails and meeting details for you to send or add yourself. It does not send email, book meetings or update your CRM. AI can make mistakes, so check names, dates and amounts.</p>
              </div>
            </div>
            <TaskList />
            <div className="flex gap-3 text-sm">
              <Link to="/commands" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><History className="w-4 h-4" /> Command history</Link>
              <Link to="/prospects" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><Users className="w-4 h-4" /> Prospects</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
