import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, TrendingDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import NavBar from '@/components/NavBar';

export default function QuietPeriodMonitor() {
  const [scanning, setScanning] = useState(false);

  const { data: alerts = [], refetch } = useQuery({
    queryKey: ['quiet-alerts'],
    queryFn: () => base44.entities.QuietPeriodAlert.filter({ alert_level: 'critical' }, '-silence_duration_days', 50),
    initialData: [],
    refetchInterval: 60000
  });

  const handleScan = async () => {
    setScanning(true);
    try {
      await base44.functions.invoke('detectQuietPeriods', {
        client_id: 'default'
      });
      setTimeout(() => refetch(), 1500);
    } finally {
      setScanning(false);
    }
  };

  const severityColor = {
    critical: 'bg-red-100 border-red-300 text-red-800',
    warning: 'bg-yellow-100 border-yellow-300 text-yellow-800'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Quiet Period Monitor</h1>
            </div>
            <p className="text-slate-500 ml-13">Detect and intervene on silent prospects</p>
          </div>
          <Button
            onClick={handleScan}
            disabled={scanning}
            className="bg-red-600 hover:bg-red-700 gap-2"
          >
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Scan Now
          </Button>
        </div>

        {/* Critical Alerts */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            Critical Silences ({alerts.filter(a => a.alert_level === 'critical').length})
          </h2>

          <div className="space-y-3">
            {alerts.filter(a => a.alert_level === 'critical').length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-slate-400">
                  <TrendingDown className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  No critical silences detected
                </CardContent>
              </Card>
            ) : (
              alerts.filter(a => a.alert_level === 'critical').map(alert => (
                <Card key={alert.id} className={`border-2 ${severityColor[alert.alert_level]}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900">{alert.prospect_name}</h3>
                        <p className="text-sm text-slate-600">
                          Silent for <span className="font-bold">{alert.silence_duration_days} days</span>
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {alert.channels_silent?.map((ch, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {ch}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Started</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {formatDistanceToNow(new Date(alert.silence_started_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Intervention Options */}
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs flex-1"
                      >
                        📹 Send Video Check-in
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs flex-1"
                      >
                        👔 Escalate to Manager
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Warning Level */}
        {alerts.filter(a => a.alert_level === 'warning').length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-yellow-700 mb-4">
              Warnings ({alerts.filter(a => a.alert_level === 'warning').length})
            </h2>
            <div className="space-y-2">
              {alerts.filter(a => a.alert_level === 'warning').map(alert => (
                <Card key={alert.id} className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{alert.prospect_name}</p>
                        <p className="text-xs text-slate-600">{alert.silence_duration_days}d silent</p>
                      </div>
                      <Badge className="bg-yellow-200 text-yellow-800">{alert.alert_level}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}