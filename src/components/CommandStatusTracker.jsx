import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle, Mic, Brain, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { key: 'transcribing', label: 'Transcribing audio', icon: Mic },
  { key: 'reasoning', label: 'Analyzing intent', icon: Brain },
  { key: 'executing', label: 'Executing action', icon: Zap },
  { key: 'completed', label: 'Done', icon: CheckCircle2 },
];

const STATUS_ORDER = ['pending', 'transcribing', 'reasoning', 'executing', 'completed', 'failed'];

export default function CommandStatusTracker({ status, compact = false }) {
  const currentIndex = STATUS_ORDER.indexOf(status);
  const isFailed = status === 'failed';

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {STEPS.slice(0, 3).map((step, i) => {
          const stepIndex = STATUS_ORDER.indexOf(step.key);
          const done = currentIndex > stepIndex && !isFailed;
          const active = currentIndex === stepIndex;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-center gap-1">
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center',
                done ? 'bg-green-500' : active ? 'bg-blue-500' : 'bg-slate-200'
              )}>
                {active && !isFailed
                  ? <Loader2 className="w-3 h-3 text-white animate-spin" />
                  : <Icon className="w-3 h-3 text-white" />
                }
              </div>
              {i < 2 && <div className={cn('w-4 h-0.5', done ? 'bg-green-400' : 'bg-slate-200')} />}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-3">
      {STEPS.map((step, i) => {
        const stepIndex = STATUS_ORDER.indexOf(step.key);
        const done = currentIndex > stepIndex && !isFailed;
        const active = currentIndex === stepIndex && !isFailed;
        const failed = isFailed && stepIndex <= currentIndex;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                done ? 'bg-green-500 shadow-sm' :
                active ? 'bg-blue-500 shadow-md ring-2 ring-blue-200' :
                failed ? 'bg-red-400' :
                'bg-slate-200'
              )}>
                {active
                  ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                  : failed
                  ? <AlertCircle className="w-4 h-4 text-white" />
                  : <Icon className="w-4 h-4 text-white" />
                }
              </div>
              <span className={cn(
                'text-xs font-medium whitespace-nowrap',
                done ? 'text-green-700' : active ? 'text-blue-700' : 'text-slate-400'
              )}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-0.5 mb-4 transition-all', done ? 'bg-green-400' : 'bg-slate-200')} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}