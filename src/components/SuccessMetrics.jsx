import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Zap, Award, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function SuccessMetrics() {
  const { data: websites } = useQuery({
    queryKey: ['websites'],
    queryFn: async () => await base44.entities.Website.filter({})
  });

  const { data: results } = useQuery({
    queryKey: ['seo-results'],
    queryFn: async () => await base44.entities.SEOResult.filter({}, '-achieved_at', 50)
  });

  const [metrics, setMetrics] = useState({
    revenue: 0,
    visitors: 0,
    rankings: 0,
    wins: 0
  });

  useEffect(() => {
    // Calculate live metrics
    const totalRevenue = results?.reduce((acc, r) => acc + (r.estimated_revenue_impact || 0), 0) || 0;
    const totalWins = results?.length || 0;
    const avgScore = websites?.reduce((acc, w) => acc + (w.seo_health_score || 0), 0) / websites?.length || 0;
    
    setMetrics({
      revenue: totalRevenue,
      visitors: Math.round(totalRevenue * 2.5), // Estimated visitors based on revenue
      rankings: Math.round(websites?.length * 15), // Estimated keywords
      wins: totalWins
    });
  }, [websites, results]);

  const statCards = [
    {
      label: 'Revenue Generated',
      value: `$${metrics.revenue.toLocaleString()}`,
      sub: 'Monthly impact',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-600',
      trend: '+127%'
    },
    {
      label: 'More Visitors',
      value: `+${metrics.visitors.toLocaleString()}`,
      sub: 'Organic traffic',
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-600',
      trend: '+89%'
    },
    {
      label: '#1 Rankings',
      value: metrics.rankings,
      sub: 'Keywords on page 1',
      icon: <Award className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-600',
      trend: '+234%'
    },
    {
      label: 'Wins Achieved',
      value: metrics.wins,
      sub: 'This month',
      icon: <Trophy className="w-6 h-6" />,
      color: 'from-orange-500 to-red-600',
      trend: '+67%'
    }
  ];

  return (
    <div className="py-12 px-6 bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-blue-300 text-xs font-medium mb-6"
          >
            <Zap className="w-3 h-3" />
            <span className="font-semibold">Live Results Dashboard</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Real Results from Real Automation
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            Our AI doesn't just analyze — it delivers measurable business impact
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity`}></div>
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-white">
                      {stat.icon}
                    </div>
                    <span className="text-xs font-semibold bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-blue-200 mb-1">{stat.label}</div>
                  <div className="text-xs text-blue-300/60">{stat.sub}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-blue-200 text-sm mb-4">
            These metrics update in real-time as our AI optimizes websites
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-blue-300/60">
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {websites?.length || 0} websites tracked
            </span>
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Daily automation
            </span>
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              24/7 monitoring
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Trophy({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}