import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Award, Star, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultsShowcase({ results }) {
  useEffect(() => {
    // Celebrate massive wins with confetti
    const massiveWins = results?.filter(r => r.impact === 'massive' || r.impact === 'high');
    if (massiveWins?.length > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981']
      });
    }
  }, [results]);

  if (!results || results.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-500" />
        Recent Wins
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.slice(0, 6).map((result, idx) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-yellow-500 text-white">
                      <Award className="w-3 h-3 mr-1" />
                      {result.metric_type.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(result.achieved_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{result.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{result.description}</p>
                  
                  {result.improvement_percentage && (
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <ArrowUpRight className="w-4 h-4" />
                      +{result.improvement_percentage}% improvement
                    </div>
                  )}
                  
                  {result.estimated_revenue_impact && (
                    <div className="mt-2 pt-2 border-t border-yellow-200">
                      <p className="text-xs text-slate-500">Est. Monthly Impact</p>
                      <p className="text-lg font-bold text-green-600">
                        +${result.estimated_revenue_impact.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                <div className={`h-1.5 bg-gradient-to-r ${
                  result.impact === 'massive' ? 'from-purple-500 to-pink-600' :
                  result.impact === 'high' ? 'from-orange-500 to-red-600' :
                  result.impact === 'medium' ? 'from-blue-500 to-cyan-600' :
                  'from-slate-400 to-slate-500'
                }`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}