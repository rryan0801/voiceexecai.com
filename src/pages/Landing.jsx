import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InteractiveDemo from '@/components/InteractiveDemo';
import ActNowDealBox from '@/components/ActNowDealBox';
import PricingCards from '@/components/PricingCards';
import TipBox from '@/components/TipBox';
import { BUSINESS_LINE, SUPPORT_EMAIL } from '@/lib/plans';
import { ArrowRight, Menu, X, Mic, Mail, Calendar, ListTodo, FileText, Info } from 'lucide-react';

const LOGO = 'https://media.base44.com/images/public/69f271da3dbd30c56bc97f06/7cf925e7b_generated_image.png';

// Every line here must match what the app really does (owner rule: no claims the code doesn't back up).
const WHAT_IT_DOES = [
  { icon: Mail, title: 'Emails, drafted and sent', text: 'Say who to email and what about. The AI writes it and sends it from your own connected Outlook account. If Outlook is not connected, you get the draft and nothing is sent.' },
  { icon: Calendar, title: 'Meetings booked', text: 'Say "set up a call with Dana tomorrow at 2pm" and it books the meeting on your connected Outlook calendar.' },
  { icon: ListTodo, title: 'Follow-up tasks', text: 'Say "remind me to call Acme on Friday" and a task is added to your list.' },
  { icon: FileText, title: 'Proposal drafts', text: 'Ask for a proposal for a prospect and get a first draft to edit.' },
];

const EXAMPLES = [
  '"Email John at TechCorp a thank-you for today\'s demo."',
  '"Book a 30-minute call with Sarah next Tuesday at 10am."',
  '"Remind me to follow up with BlueSky on Friday."',
  '"Draft a proposal for Acme Corp."',
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={LOGO} alt="VoiceExecAI logo" className="w-8 h-8" />
            <span className="font-bold text-lg">VoiceExec<span className="text-blue-600">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#how-it-works" className="hover:text-blue-600">How it works</a>
            <a href="#pricing" className="hover:text-blue-600">Pricing</a>
            <Link to="/pricing" className="hover:text-blue-600">Plans & FAQ</Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">Sign In</Link>
            <a href="#pricing" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg">See plans</a>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-100 pt-4 flex flex-col gap-3 text-sm">
            <a href="#how-it-works" className="px-2 py-1.5" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#pricing" className="px-2 py-1.5" onClick={() => setMenuOpen(false)}>Pricing</a>
            <Link to="/pricing" className="px-2 py-1.5">Plans & FAQ</Link>
            <Link to="/dashboard" className="px-2 py-1.5">Sign In</Link>
          </div>
        )}
      </nav>

      <div className="px-6 pt-6 bg-blue-50">
        <ActNowDealBox showButton className="max-w-4xl mx-auto" />
      </div>

      <section className="pt-16 pb-20 px-6 bg-gradient-to-br from-blue-50 via-violet-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-full text-blue-700 text-xs font-semibold mb-8">
            <Mic className="w-3 h-3" /> A voice assistant for sales reps
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Say it once.<br />
            <span className="text-blue-600">Your follow-up gets done.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
            VoiceExecAI turns a spoken command into a sent email, a booked meeting or a follow-up task —
            so you spend less time clicking and more time selling.
          </p>
          <div className="max-w-2xl mx-auto mb-10 grid sm:grid-cols-2 gap-3 text-left">
            {EXAMPLES.map((t) => (
              <div key={t} className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium">{t}</div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#pricing" className="flex items-center gap-2 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-lg shadow-xl w-full sm:w-auto justify-center">
              See plans <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#demo" className="px-8 py-5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-lg hover:bg-slate-50 w-full sm:w-auto text-center">
              Watch an example
            </a>
          </div>
          <p className="text-xs text-slate-400 mt-6">Paid plans only. Works in your web browser on computer or phone.</p>
        </div>
      </section>

      <section id="demo" className="bg-white"><InteractiveDemo /></section>

      <section id="how-it-works" className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">What VoiceExecAI does</h2>
            <p className="text-lg text-slate-500">You hold the mic button and talk. The AI works out what you want and does it.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {WHAT_IT_DOES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-white rounded-xl p-6 border border-slate-200">
                <Icon className="w-6 h-6 text-blue-600 mb-3" />
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-slate-500">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-white border border-slate-200 rounded-xl p-6 flex gap-3">
            <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600 space-y-1">
              <p><strong>Good to know:</strong> VoiceExecAI does not answer or make phone calls. It acts only when you give it a command.</p>
              <p>AI can make mistakes. Check what it drafts, especially names, dates and amounts.</p>
              <p>Sending email and booking meetings need your Outlook account connected.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-4">Simple pricing</h2>
            <p className="text-lg text-slate-500">Paid plans only. Cancel any time by email.</p>
          </div>
          <ActNowDealBox className="mb-12 max-w-4xl mx-auto" />
          <PricingCards />
        </div>
      </section>

      <TipBox />

      <footer className="py-12 px-6 bg-slate-900 text-slate-300 text-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <img src={LOGO} alt="VoiceExecAI logo" className="w-7 h-7" />
                <span className="font-bold text-white text-base">VoiceExecAI</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs">A voice assistant that turns spoken commands into emails, meetings and follow-up tasks.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Product</h4>
              <div className="space-y-2">
                <a href="#how-it-works" className="block hover:text-white">How it works</a>
                <Link to="/pricing" className="block hover:text-white">Pricing & FAQ</Link>
                <Link to="/dashboard" className="block hover:text-white">Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Company</h4>
              <div className="space-y-2">
                <Link to="/contact" className="block hover:text-white">Contact</Link>
                <Link to="/privacy" className="block hover:text-white">Privacy</Link>
                <Link to="/terms" className="block hover:text-white">Terms</Link>
                <Link to="/security" className="block hover:text-white">Security</Link>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">More from Richy Ryan</h4>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
              <a href="https://heyrichyai.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">Hey Richy AI</a>
              <a href="https://richyryanofficial.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">Richy Ryan — Tech & AI</a>
              <a href="https://wordforge.games" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">WordForge — Daily Word Game</a>
              <a href="https://richyryan.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">Richy Ryan — Faith & Culture</a>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-slate-500 text-xs space-y-1">
            <p>© 2026 VoiceExecAI, a product of {BUSINESS_LINE}.</p>
            <p>Questions: <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white">{SUPPORT_EMAIL}</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
