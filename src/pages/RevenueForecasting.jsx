import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import NavBar from '@/components/NavBar';

export default function RevenueForecasting() {
  const [forecasting, setForecasting] = useState(false);

  const { data: forecasts = [], refetch } = useQuery({
    queryKey: ['revenue-forecasts'],
    queryFn: () => base44.entities.RevenueForecast.list('-predicted_at', 10),
    initialData: []
  });

  const handleForecast = async () => {
    setForecasting(true);
    try {
      await base44.functions.invoke('forecastRevenue', {
        client_id: 'default',
        forecast_period: 'quarterly'
      });
      setTimeout(() => refetch(), 1000);
    } finally {
      setForecasting(false);
    }
  };

  const latest = forecasts[0];

  const chartData = [
    { month: 'Conservative', value: latest?.conservative_forecast || 0 },
    { month: 'Expected', value: latest?.weighted_expected_revenue || 0 },
    { month: 'Optimistic', value: latest?.optimistic_forecast || 0 }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Revenue Forecasting</h1>
            </div>
            <p className="text-slate-500 ml-13">Predict quarterly/annual revenue with confidence bands</p>
          </div>
          <Button
            onClick={handleForecast}
            disabled={forecasting}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            {forecasting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Calculate Forecast
          </Button>
        </div>

        {latest ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-slate-600 text-sm">Expected Revenue</p>
                  <p className="text-3xl font-bold text-slate-900">${(latest.weighted_expected_revenue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-slate-500 mt-1">{latest.confidence_level}% confidence</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-slate-600 text-sm">Conservative</p>
                  <p className="text-3xl font-bold text-yellow-600">${(latest.conservative_forecast / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-slate-500 mt-1">25th percentile</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-slate-600 text-sm">Optimistic</p>
                  <p className="text-3xl font-bold text-green-600">${(latest.optimistic_forecast / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-slate-500 mt-1">75th percentile</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-slate-600 text-sm">Deals Included</p>
                  <p className="text-3xl font-bold text-slate-900">{latest.deals_included}</p>
                  <p className="text-xs text-green-600 mt-1">✓ {latest.historical_accuracy}% accurate</p>
                </CardContent>
              </Card>
            </div>

            {/* Forecast Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Scenarios</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Deals */}
            <Card>
              <CardHeader>
                <CardTitle>Top Deals Contributing to Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {latest.key_deals?.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{d.prospect}</p>
                        <p className="text-sm text-slate-500">${(d.value / 1000).toFixed(0)}K deal value</p>
                      </div>
                      <Badge className={d.probability > 75 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {d.probability}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center text-slate-400">
              Click "Calculate Forecast" to generate revenue predictions
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}