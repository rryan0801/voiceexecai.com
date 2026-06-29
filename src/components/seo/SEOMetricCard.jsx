import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function SEOMetricCard({ title, value, change, trend, icon, subtitle, color = 'from-blue-500 to-violet-600' }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-400';

  return (
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
      <CardContent className="p-0">
        <div className={`bg-gradient-to-br ${color} p-5 text-white`}>
          <div className="flex items-center justify-between mb-3">
            <div className="opacity-90">{icon}</div>
            {change && (
              <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor} bg-white/20 px-2 py-1 rounded-full`}>
                <TrendIcon className="w-3 h-3" />
                {change}
              </div>
            )}
          </div>
          <div className="text-3xl font-bold mb-1">{value}</div>
          <div className="text-sm opacity-80">{title}</div>
          {subtitle && <div className="text-xs opacity-60 mt-1">{subtitle}</div>}
        </div>
      </CardContent>
    </Card>
  );
}