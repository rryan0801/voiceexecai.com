import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Globe, RefreshCw } from 'lucide-react';

export default function WebsiteCard({ website, onSelect, onAudit }) {
  const scoreColor = website.seo_health_score >= 80 ? 'text-green-600' : 
                     website.seo_health_score >= 60 ? 'text-yellow-600' : 'text-red-600';
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group">
      <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                {website.name.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-lg">{website.name}</CardTitle>
                <CardDescription className="text-xs truncate max-w-[200px]">{website.url}</CardDescription>
              </div>
            </div>
            <div className={`text-2xl font-bold ${scoreColor}`}>{website.seo_health_score || '--'}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-slate-500">SEO Health Score</div>
            <Badge variant={website.status === 'active' ? 'default' : 'secondary'} className="text-xs">{website.status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div className="flex items-center gap-1 text-slate-600">
              <Search className="w-3 h-3" />{website.target_keywords?.length || 0} keywords
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <Globe className="w-3 h-3" />{website.competitors?.length || 0} competitors
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => onSelect(website)}>Dashboard</Button>
            <Button size="sm" variant="outline" onClick={() => onAudit(website.id)}>
              <RefreshCw className="w-3 h-3 mr-1" />Audit
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}