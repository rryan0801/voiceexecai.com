import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mic, LayoutDashboard, Users, Zap, BarChart3, TestTube, Bot, UsersRound, MessageCircle, Phone, BookOpen, TrendingUp, Beaker, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/deals', label: 'Deals', icon: TrendingUp },
  { path: '/crm-comms', label: 'CRM+Comms', icon: Zap },
  { path: '/conversation-context', label: 'Context', icon: MessageCircle },
  { path: '/conversations', label: 'Conversations', icon: MessageCircle },
  { path: '/meeting-prep', label: 'Meeting Prep', icon: Phone },
  { path: '/playbooks', label: 'Playbooks', icon: BookOpen },
  { path: '/email-engagement', label: 'Email', icon: Mail },
  { path: '/linkedin-monitor', label: 'LinkedIn', icon: TrendingUp },
  { path: '/crm-adapter', label: 'CRM Adapter', icon: Zap },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/commands', label: 'Commands', icon: Zap },
  { path: '/prospects', label: 'Prospects', icon: Users },
  { path: '/team', label: 'Team', icon: UsersRound },
  { path: '/autopilot', label: 'AutoPilot', icon: Bot },
  { path: '/tests', label: 'Tests', icon: Beaker },
];

export default function NavBar() {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg hidden sm:block">VoiceExec <span className="text-blue-600">AI</span></span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-0.5">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              const isAutoPilot = path === '/autopilot';
              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? isAutoPilot ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{label}</span>
                  {isAutoPilot && <span className="hidden lg:inline text-xs bg-violet-200 text-violet-700 rounded px-1 py-0.5 leading-none">AI</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}