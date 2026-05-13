import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Mic, LayoutDashboard, Users, Zap, BarChart3, Bot, UsersRound,
  MessageCircle, Phone, BookOpen, TrendingUp, Mail, AlertCircle,
  Target, DollarSign, ChevronDown, Menu, X, Brain, Calendar,
  GitBranch, Beaker, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/actions', label: 'Actions', icon: Zap },
      { path: '/leaderboard', label: 'Leaderboard', icon: TrendingUp },
    ]
  },
  {
    label: 'Deals & Pipeline',
    items: [
      { path: '/deals', label: 'Deal Intelligence', icon: Target },
      { path: '/deal-physics', label: 'Deal Physics', icon: GitBranch },
      { path: '/deal-rooms', label: 'Deal Rooms', icon: Users },
      { path: '/win-loss', label: 'Win/Loss', icon: BarChart3 },
      { path: '/forecasting', label: 'Revenue Forecast', icon: TrendingUp },
      { path: '/objection-preflight', label: 'Objections', icon: AlertCircle },
      { path: '/readiness-pulse', label: 'Readiness Pulse', icon: Brain },
      { path: '/quiet-monitor', label: 'Quiet Monitor', icon: AlertCircle },
    ]
  },
  {
    label: 'Communications',
    items: [
      { path: '/crm-comms', label: 'CRM + Comms', icon: Zap },
      { path: '/email-engagement', label: 'Email Tracking', icon: Mail },
      { path: '/email-studio', label: 'Email Studio', icon: Mail },
      { path: '/sms', label: 'SMS Threads', icon: MessageCircle },
      { path: '/linkedin-monitor', label: 'LinkedIn Signals', icon: TrendingUp },
      { path: '/linkedin-messaging', label: 'LinkedIn Messages', icon: MessageCircle },
      { path: '/calendar-analytics', label: 'Calendar', icon: Calendar },
    ]
  },
  {
    label: 'AI & Coaching',
    items: [
      { path: '/conversations', label: 'Conversations', icon: MessageCircle },
      { path: '/conversation-context', label: 'Context Manager', icon: MessageCircle },
      { path: '/meeting-prep', label: 'Meeting Copilot', icon: Phone },
      { path: '/coaching', label: 'Coaching Center', icon: Brain },
      { path: '/rep-dna', label: 'Rep DNA', icon: Users },
      { path: '/autopilot', label: 'AutoPilot', icon: Bot, badge: 'AI' },
      { path: '/playbooks', label: 'Playbooks', icon: BookOpen },
    ]
  },
  {
    label: 'Management',
    items: [
      { path: '/prospects', label: 'Prospects', icon: Users },
      { path: '/team', label: 'Team', icon: UsersRound },
      { path: '/commands', label: 'Commands', icon: Zap },
      { path: '/crm-adapter', label: 'CRM Adapter', icon: Settings },
      { path: '/billshield', label: 'BillShield', icon: DollarSign },
      { path: '/tests', label: 'Tests', icon: Beaker },
    ]
  }
];

function NavDropdown({ group, isActive }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const hasActive = group.items.some(item => location.pathname === item.path);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        className={cn(
          'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          hasActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        )}
      >
        {group.label}
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
          {group.items.map(({ path, label, icon: Icon, badge }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-2.5 px-4 py-2 text-sm transition-colors',
                  active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0 opacity-70" />
                <span className="flex-1">{label}</span>
                {badge && <span className="text-xs bg-violet-100 text-violet-700 rounded px-1.5 py-0.5 leading-none">{badge}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function NavBar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-base hidden sm:block">
              VoiceExec<span className="text-blue-600">AI</span>
            </span>
          </Link>

          {/* Desktop Nav — grouped dropdowns */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_GROUPS.map((group) => (
              <NavDropdown key={group.label} group={group} />
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden md:inline-flex text-xs text-slate-500 hover:text-slate-800 transition-colors px-2 py-1 rounded hover:bg-slate-100"
            >
              ← Landing
            </Link>
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white max-h-[80vh] overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="py-2 border-b border-slate-100 last:border-0">
              <p className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">{group.label}</p>
              {group.items.map(({ path, label, icon: Icon, badge }) => {
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                      active ? 'text-blue-700 bg-blue-50 font-medium' : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <Icon className="w-4 h-4 opacity-70" />
                    {label}
                    {badge && <span className="ml-auto text-xs bg-violet-100 text-violet-700 rounded px-1.5 py-0.5">{badge}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}