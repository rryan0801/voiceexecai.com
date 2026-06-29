import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Target, Award, Zap } from 'lucide-react';

export default function QuickStats({ website }) {
  const stats = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Avg. Rank',
      value: '#12',
      change: '+3.2',
      trend: 'up',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: 'Keywords Tracked',
      value: '47',
      change: '+12',
      trend: 'up',
      color: 'from-blue-500 to-violet-600'
    },
    {
      icon: <Award className="w-5 h-5" />,
      label: 'Issues Fixed',
      value: '23',
      change: 'this week',
      trend: 'neutral',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'SEO Score',
      value: '87',
      change: '+14 pts',
      trend: 'up',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="grid md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="overflow-hidden border-0 shadow-lg">
            <CardContent className="p-0">
              <div className={`bg-gradient-to-br ${stat.color} p-4 text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="opacity-90">{stat.icon}</div>
                  {stat.trend === 'up' && (
                    <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                      ↑ {stat.change}
                    </span>
                  )}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs opacity-80">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}