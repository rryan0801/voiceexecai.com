import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Users, Mail, Send, BarChart3, ChevronDown, X, CheckCircle, ArrowRight,
  Phone, MapPin, Briefcase, Edit3, Filter, Search, Eye, Loader2
} from 'lucide-react';

const STAGES = [
  { id: 'new', label: 'New', color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  { id: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  { id: 'nurturing', label: 'Nurturing', color: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  { id: 'converted', label: 'Converted', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  { id: 'lost', label: 'Lost', color: 'bg-red-100 text-red-700', dot: 'bg-red-400' }
];

const EMAIL_TEMPLATES = [
  {
    type: 'welcome',
    label: 'Welcome Email',
    subject: 'Welcome to VoiceExecAI Leads, {{name}}!',
    body: `Hi {{name}},\n\nWelcome! You're now in our lead network for {{vertical}} contractors in {{city}}, {{state}}.\n\nHere's what happens next:\n- We match you with verified buyers in your area\n- You get notified immediately when a lead matches\n- Full contact info delivered to your inbox\n\nReady to get started? Check out our plans: https://voiceexecai.com/pricing\n\n— The VoiceExecAI Team`
  },
  {
    type: 'follow_up',
    label: 'Follow-Up',
    subject: 'Still looking for {{vertical}} leads near {{city}}?',
    body: `Hi {{name}},\n\nJust checking in — we have active buyers looking for {{vertical}} services in your area right now.\n\nDon't miss out. Leads go to the first contractor to respond.\n\nView available leads: https://voiceexecai.com/pricing\n\n— VoiceExecAI Leads`
  },
  {
    type: 'promo',
    label: 'Promo Offer',
    subject: 'Limited: First 3 leads FREE for {{vertical}} contractors',
    body: `Hi {{name}},\n\nFor a limited time, we're offering your first 3 leads completely free — no credit card required.\n\nThis is for {{vertical}} contractors in {{city}} only, and spots are limited.\n\nClaim your free leads: https://voiceexecai.com/pricing\n\nOffer expires in 48 hours.\n\n— VoiceExecAI Leads`
  },
  {
    type: 'custom',
    label: 'Custom Message',
    subject: '',
    body: ''
  }
];

function StageTag({ stage }) {
  const s = STAGES.find(x => x.id === stage) || STAGES[0];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function LeadCard({ lead, selected, onSelect, onStageChange, onNoteUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(lead.notes || '');
  const [savingNote, setSavingNote] = useState(false);
  const qc = useQueryClient();

  const saveNote = async () => {
    setSavingNote(true);
    await base44.entities.BuyerLead.update(lead.id, { notes: note });
    qc.invalidateQueries(['buyer-leads']);
    setSavingNote(false);
  };

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-all ${selected ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox" checked={selected} onChange={onSelect}
            className="mt-1 rounded border-slate-300 text-blue-600 cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="font-semibold text-slate-900 text-sm truncate">{lead.name}</p>
              <StageTag stage={lead.stage} />
            </div>
            <p className="text-xs text-slate-500 truncate">{lead.email}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.city}, {lead.state}</span>
              <span className="capitalize">{lead.vertical?.replace('_', ' ')}</span>
            </div>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-400 text-xs">Phone</span><p className="font-medium">{lead.phone}</p></div>
            <div><span className="text-slate-400 text-xs">Company</span><p className="font-medium">{lead.company || '—'}</p></div>
            <div><span className="text-slate-400 text-xs">Submitted</span><p className="font-medium">{lead.submitted_at ? new Date(lead.submitted_at).toLocaleDateString() : '—'}</p></div>
            <div>
              <span className="text-slate-400 text-xs block mb-1">Move Stage</span>
              <select
                value={lead.stage} onChange={e => onStageChange(lead.id, e.target.value)}
                className="text-xs border border-slate-200 rounded px-2 py-1 bg-white w-full"
              >
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Notes</label>
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              placeholder="Add notes about this lead..."
              className="w-full text-xs border border-slate-200 rounded-lg p-2 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
            />
            <button
              onClick={saveNote} disabled={savingNote}
              className="mt-1 text-xs text-blue-600 hover:underline font-medium disabled:opacity-50"
            >
              {savingNote ? 'Saving...' : 'Save note'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeadPipeline() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('pipeline');
  const [selectedIds, setSelectedIds] = useState([]);
  const [stageFilter, setStageFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [template, setTemplate] = useState(EMAIL_TEMPLATES[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['buyer-leads'],
    queryFn: () => base44.entities.BuyerLead.list('-submitted_at', 200)
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['outreach-campaigns'],
    queryFn: () => base44.entities.OutreachCampaign.list('-created_date', 50)
  });

  const filtered = leads.filter(l => {
    const matchStage = stageFilter === 'all' || l.stage === stageFilter;
    const matchSearch = !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase()) || l.city?.toLowerCase().includes(search.toLowerCase());
    return matchStage && matchSearch;
  });

  const stageCount = (stage) => leads.filter(l => l.stage === stage).length;

  const handleStageChange = async (id, stage) => {
    await base44.entities.BuyerLead.update(id, { stage });
    qc.invalidateQueries(['buyer-leads']);
  };

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(l => l.id));

  const pickTemplate = (tpl) => {
    setTemplate(tpl);
    setCustomSubject(tpl.subject);
    setCustomBody(tpl.body);
  };

  const handleSendCampaign = async () => {
    if (!selectedIds.length) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await base44.functions.invoke('sendOutreachCampaign', {
        lead_ids: selectedIds,
        subject: customSubject,
        body: customBody,
        template_type: template.type,
        campaign_name: campaignName || `${template.label} — ${new Date().toLocaleDateString()}`
      });
      setSendResult(res.data);
      qc.invalidateQueries(['outreach-campaigns']);
      setSelectedIds([]);
    } catch (err) {
      setSendResult({ error: err.message });
    } finally {
      setSending(false);
    }
  };

  const totalConversions = leads.filter(l => l.stage === 'converted').length;
  const conversionRate = leads.length ? Math.round((totalConversions / leads.length) * 100) : 0;
  const totalSent = campaigns.reduce((s, c) => s + (c.sent_count || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Lead Pipeline</h1>
            <p className="text-sm text-slate-500">{leads.length} total leads</p>
          </div>
          <div className="flex items-center gap-3">
            {['pipeline', 'outreach', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Stage summary */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {STAGES.map(s => (
            <button
              key={s.id}
              onClick={() => setStageFilter(stageFilter === s.id ? 'all' : s.id)}
              className={`p-4 rounded-xl border text-left transition-all ${stageFilter === s.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <p className="text-2xl font-bold text-slate-900">{stageCount(s.id)}</p>
              <p className={`text-xs font-medium mt-1 ${s.color.split(' ')[1]}`}>{s.label}</p>
            </button>
          ))}
        </div>

        {/* Pipeline Tab */}
        {activeTab === 'pipeline' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search leads..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>
              {selectedIds.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => { setComposerOpen(true); setActiveTab('outreach'); }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-medium rounded-lg"
                >
                  <Mail className="w-4 h-4" />
                  Email {selectedIds.length} selected
                </motion.button>
              )}
              <button onClick={toggleAll} className="text-sm text-blue-600 hover:underline">
                {selectedIds.length === filtered.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No leads yet. Share your <a href="/get-leads" className="text-blue-500 hover:underline">lead capture page</a>.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    selected={selectedIds.includes(lead.id)}
                    onSelect={() => toggleSelect(lead.id)}
                    onStageChange={handleStageChange}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Outreach Tab */}
        {activeTab === 'outreach' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Composer */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" /> Email Composer
              </h2>

              <div className="mb-4">
                <label className="text-sm font-medium text-slate-700 block mb-2">Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {EMAIL_TEMPLATES.map(tpl => (
                    <button
                      key={tpl.type}
                      onClick={() => pickTemplate(tpl)}
                      className={`text-left px-3 py-2 rounded-lg border text-sm transition-all ${template.type === tpl.type ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Campaign Name</label>
                  <input
                    value={campaignName} onChange={e => setCampaignName(e.target.value)}
                    placeholder="e.g. June Promo Blast"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Subject</label>
                  <input
                    value={customSubject} onChange={e => setCustomSubject(e.target.value)}
                    placeholder="Email subject..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">
                    Body <span className="text-xs text-slate-400 font-normal">Use {'{{name}}'}, {'{{city}}'}, {'{{vertical}}'}</span>
                  </label>
                  <textarea
                    value={customBody} onChange={e => setCustomBody(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none font-mono"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-100">
                {selectedIds.length > 0
                  ? <><strong>{selectedIds.length} leads</strong> selected to receive this email.</>
                  : <span className="text-slate-400">← Select leads from the Pipeline tab to send to.</span>}
              </div>

              {sendResult && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${sendResult.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {sendResult.error ? `Error: ${sendResult.error}` : `✅ Sent to ${sendResult.sent_count} leads successfully!`}
                </div>
              )}

              <button
                onClick={handleSendCampaign}
                disabled={sending || !selectedIds.length || !customSubject || !customBody}
                className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Sending...' : `Send to ${selectedIds.length} Leads`}
              </button>
            </div>

            {/* Campaign History */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Campaign History</h2>
              {campaigns.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Send className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No campaigns sent yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map(c => (
                    <div key={c.id} className="p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-slate-800 text-sm">{c.name}</p>
                        <span className="text-xs text-slate-400">{c.sent_at ? new Date(c.sent_at).toLocaleDateString() : '—'}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3 truncate">{c.subject}</p>
                      <div className="flex gap-4 text-xs">
                        <div><span className="text-slate-400">Sent</span> <strong className="text-slate-700">{c.sent_count || 0}</strong></div>
                        <div><span className="text-slate-400">Opens</span> <strong className="text-slate-700">{c.open_count || '—'}</strong></div>
                        <div><span className="text-slate-400">Converted</span> <strong className="text-green-600">{c.converted_count || 0}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Leads', value: leads.length, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Converted', value: totalConversions, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Conversion Rate', value: `${conversionRate}%`, color: 'text-violet-600', bg: 'bg-violet-50' },
              { label: 'Emails Sent', value: totalSent, color: 'text-orange-600', bg: 'bg-orange-50' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`${stat.bg} rounded-2xl p-6`}
              >
                <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </motion.div>
            ))}

            <div className="sm:col-span-2 lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Leads by Stage</h3>
              <div className="space-y-3">
                {STAGES.map(s => {
                  const count = stageCount(s.id);
                  const pct = leads.length ? Math.round((count / leads.length) * 100) : 0;
                  return (
                    <div key={s.id} className="flex items-center gap-3">
                      <div className="w-24 text-sm text-slate-600">{s.label}</div>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                        />
                      </div>
                      <div className="text-sm text-slate-500 w-16 text-right">{count} ({pct}%)</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Campaign Performance</h3>
              {campaigns.length === 0 ? (
                <p className="text-slate-400 text-sm">No campaigns yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                      <th className="pb-2">Campaign</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Sent</th>
                      <th className="pb-2">Opens</th>
                      <th className="pb-2">Converted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {campaigns.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 font-medium text-slate-800 max-w-[180px] truncate">{c.name}</td>
                        <td className="py-2.5 text-slate-500">{c.sent_at ? new Date(c.sent_at).toLocaleDateString() : '—'}</td>
                        <td className="py-2.5">{c.sent_count || 0}</td>
                        <td className="py-2.5 text-slate-400">{c.open_count || '—'}</td>
                        <td className="py-2.5 text-green-600 font-semibold">{c.converted_count || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}