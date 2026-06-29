import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Zap, BarChart3, Bot, UsersRound,
  MessageCircle, Phone, BookOpen, TrendingUp, Mail, AlertCircle,
  Target, DollarSign, ChevronDown, Menu, X, Brain, Calendar,
  GitBranch, Beaker, Settings, LogOut, User, Globe, Trophy, Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';

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
      { path: '/seo-automator', label: 'SEO Automator', icon: Globe, badge: 'NEW' },
      { path: '/seo-results', label: 'SEO Results', icon: Trophy, badge: 'HOT' },
      { path: '/mobile-app', label: 'Mobile App', icon: Smartphone },
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

function UserMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <span className="hidden md:block text-sm text-slate-700 font-medium max-w-[120px] truncate">
          {user.full_name || user.email}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.full_name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            {user.role && (
              <span className="text-xs bg-blue-50 text-blue-700 rounded px-1.5 py-0.5 mt-1 inline-block capitalize">{user.role}</span>
            )}
          </div>
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
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
            <img
              src="https://media.base44.com/images/public/69f271da3dbd30c56bc97f06/7cf925e7b_generated_image.png"
              alt="VoiceExecAI"
              className="w-8 h-8"
            />
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
            <UserMenu />
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