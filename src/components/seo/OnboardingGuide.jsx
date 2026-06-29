import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, ArrowRight, Zap, Target, FileText, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OnboardingGuide({ completedSteps, totalSteps = 5 }) {
  const steps = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Add Your Website',
      desc: 'Enter your website URL and basic info',
      color: 'bg-blue-500'
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: 'Run Initial Audit',
      desc: 'AI scans your site for SEO issues',
      color: 'bg-purple-500'
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Review Optimizations',
      desc: 'AI generates meta tags and fixes',
      color: 'bg-orange-500'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Track Keywords',
      desc: 'Monitor your Google rankings daily',
      color: 'bg-green-500'
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: 'Watch It Grow',
      desc: 'See traffic and rankings improve',
      color: 'bg-pink-500'
    }
  ];

  const progress = (completedSteps / totalSteps) * 100;

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-violet-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🚀 Getting Started
            </CardTitle>
            <CardDescription>Follow these steps to launch your SEO</CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            {completedSteps}/{totalSteps} complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-violet-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {steps.map((step, idx) => {
            const isCompleted = idx < completedSteps;
            const isCurrent = idx === completedSteps;

            return (
              <div
                key={idx}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                  isCurrent
                    ? 'bg-white border-blue-400 shadow-md'
                    : isCompleted
                    ? 'bg-white/50 border-slate-200'
                    : 'bg-white/30 border-slate-100'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                    isCompleted ? 'bg-green-500' : isCurrent ? step.color : 'bg-slate-300'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : step.icon}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${isCurrent ? 'text-blue-900' : 'text-slate-700'}`}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-slate-500">{step.desc}</p>
                </div>
                {isCurrent && (
                  <Button size="sm" className="flex-shrink-0">
                    Start
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function motion({ children, style }) {
  return <div style={style}>{children}</div>;
}