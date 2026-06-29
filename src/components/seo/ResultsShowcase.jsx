import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Target, DollarSign, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResultsShowcase({ websiteId }) {
  // Mock results - in production, fetch from SEOResult entity
  const results = [
    {
      type: 'ranking_improvement',
      title: 'Keyword Reached #1',
      description: '"voice commands" moved from #23 to #1',
      before: 23,
      after: 1,
      improvement: 96,
      impact: 'high',
      date: '2 days ago'
    },
    {
      type: 'traffic_increase',
      title: 'Traffic Doubled',
      description: 'Organic sessions increased 104%',
      before: 500,
      after: 1020,
      improvement: 104,
      impact: 'massive',
      date: '1 week ago'
    },
    {
      type: 'issue_fixed',
      title: 'Critical SEO Issue Fixed',
      description: 'Missing meta descriptions on 47 pages',
      improvement: 100,
      impact: 'high',
      date: '2 weeks ago'
    },
    {
      type: 'competitor_overtaken',
      title: 'Outranked Competitor',
      description: 'Now ranking higher than competitor.com for 12 keywords',
      improvement: 100,
      impact: 'high',
      date: '3 weeks ago'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Recent Wins
        </CardTitle>
        <CardDescription>SEO improvements and milestones achieved</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((result, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                    {result.type === 'ranking_improvement' ? <Target className="w-5 h-5" /> :
                     result.type === 'traffic_increase' ? <TrendingUp className="w-5 h-5" /> :
                     result.type === 'issue_fixed' ? <CheckCircle className="w-5 h-5" /> :
                     <Award className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-green-900">{result.title}</h4>
                      <Badge className={`text-xs ${
                        result.impact === 'massive' ? 'bg-purple-100 text-purple-700' :
                        result.impact === 'high' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {result.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-green-700">{result.description}</p>
                    <p className="text-xs text-green-600 mt-2">{result.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">+{result.improvement}%</div>
                  <div className="text-xs text-green-600">improvement</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-violet-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Total Impact This Month</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-blue-700">
                  <TrendingUp className="w-4 h-4" />
                  +2,340 organic visitors
                </span>
                <span className="flex items-center gap-1 text-blue-700">
                  <DollarSign className="w-4 h-4" />
                  $4,680 estimated revenue
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">47</p>
              <p className="text-xs text-blue-600">wins achieved</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CheckCircle({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}