import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Zap, RefreshCw } from 'lucide-react';

export default function AutomationStatus({ lastRun, nextRun, isActive }) {
  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Automation Active</CardTitle>
              <CardDescription className="text-xs">Your SEO runs on autopilot</CardDescription>
            </div>
          </div>
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Running
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs text-slate-500">Last run</p>
              <p className="font-medium text-green-900">{lastRun || 'Today, 3:00 AM'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs text-slate-500">Next run</p>
              <p className="font-medium text-green-900">{nextRun || 'Tomorrow, 3:00 AM'}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
          <p className="text-xs font-medium text-green-800 mb-2">What happens automatically:</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Daily SEO audits
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Rank tracking
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Critical fixes
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Traffic sync
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <RefreshCw className="w-3 h-3 mr-2" />
            Run Now
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}