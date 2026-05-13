import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, ArrowRight, Users, Zap, Settings, BarChart3, Mic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STEPS = [
  {
    id: 'create_client',
    title: 'Create your first client',
    desc: 'Add a client account to start managing their voice commands and widget configuration.',
    action: null, // handled by parent
    actionLabel: 'Create Client',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    id: 'configure_widget',
    title: 'Configure the widget',
    desc: 'Customize the look and behavior of the voice widget for your client.',
    action: '/dashboard',
    actionLabel: 'Go to Settings',
    icon: Settings,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    id: 'test_widget',
    title: 'Test the voice widget',
    desc: 'Use the widget test page to try out voice commands and verify everything works.',
    action: '/widget-test',
    actionLabel: 'Open Widget Test',
    icon: Mic,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    id: 'add_prospects',
    title: 'Add your prospects',
    desc: 'Import or create prospects so your reps can use voice commands to log interactions.',
    action: '/prospects',
    actionLabel: 'Add Prospects',
    icon: Users,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    id: 'view_analytics',
    title: 'Monitor analytics',
    desc: 'Once commands flow in, track performance, win rates, and coaching insights.',
    action: '/analytics',
    actionLabel: 'View Analytics',
    icon: BarChart3,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
  },
];

export default function GettingStarted({ hasClients, onCreateClient }) {
  const completedSteps = hasClients
    ? ['create_client']
    : [];

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Welcome to VoiceExecAI!</CardTitle>
            <p className="text-sm text-slate-500 mt-0.5">Follow these steps to get up and running.</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>{completedSteps.length} of {STEPS.length} steps completed</span>
            <span>{Math.round((completedSteps.length / STEPS.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedSteps.length / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {STEPS.map((step, i) => {
          const done = completedSteps.includes(step.id);
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                done
                  ? 'bg-green-50 border-green-100 opacity-70'
                  : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50/30'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {done
                  ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                  : <Circle className="w-5 h-5 text-slate-300" />
                }
              </div>
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${step.bg}`}>
                <Icon className={`w-4 h-4 ${step.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${done ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {i + 1}. {step.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
              {!done && (
                step.action ? (
                  <Link
                    to={step.action}
                    className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {step.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    onClick={onCreateClient}
                    className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {step.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}