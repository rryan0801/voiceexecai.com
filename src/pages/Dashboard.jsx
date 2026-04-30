import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Copy, Settings, BarChart3, Zap, RefreshCw, TrendingUp, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import ClientsList from '@/components/dashboard/ClientsList';
import ClientForm from '@/components/dashboard/ClientForm';
import WidgetConfigurator from '@/components/dashboard/WidgetConfigurator';
import CommandHistory from '@/components/dashboard/CommandHistory';
import NavBar from '@/components/NavBar';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Fetch clients
  const { data: clients = [], refetch: refetchClients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-updated_date', 50),
    initialData: []
  });

  // Fetch usage data
  const { data: usageData = [], refetch: refetchUsage } = useQuery({
    queryKey: ['usage'],
    queryFn: async () => {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      return base44.entities.UsageMeter.filter({ month }, '-created_date', 50);
    },
    initialData: []
  });

  // Fetch recent commands
  const { data: recentCommands = [] } = useQuery({
    queryKey: ['commands'],
    queryFn: () => base44.entities.Command.list('-created_date', 20),
    initialData: []
  });

  // Calculate stats
  const totalRequests = usageData.reduce((sum, m) => sum + (m.total_requests || 0), 0);
  const activeClients = clients.filter(c => c.status === 'active').length;
  const failedRequests = usageData.reduce((sum, m) => sum + (m.failed_requests || 0), 0);

  // Usage chart data
  const chartData = clients.map(client => {
    const usage = usageData.find(u => u.client_id === client.id);
    return {
      name: client.company_name,
      requests: usage?.total_requests || 0,
      quota: client.monthly_quota || 10000
    };
  });

  // Command status distribution
  const commandStatus = {
    completed: recentCommands.filter(c => c.status === 'completed').length,
    failed: recentCommands.filter(c => c.status === 'failed').length,
    pending: recentCommands.filter(c => c.status === 'pending' || c.status === 'transcribing' || c.status === 'parsing' || c.status === 'executing').length
  };

  const statusData = [
    { name: 'Completed', value: commandStatus.completed },
    { name: 'Failed', value: commandStatus.failed },
    { name: 'Pending', value: commandStatus.pending }
  ];

  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage clients and monitor API usage</p>
          </div>
          <Button
            onClick={() => setShowNewClientForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            + New Client
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{clients.length}</div>
              <p className="text-xs text-green-600 mt-1">{activeClients} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalRequests}</div>
              <p className="text-xs text-slate-500 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {totalRequests > 0 ? Math.round(((totalRequests - failedRequests) / totalRequests) * 100) : 0}%
              </div>
              <p className="text-xs text-red-600 mt-1">{failedRequests} failed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {usageData.length > 0 
                  ? Math.round(usageData.reduce((sum, u) => sum + (u.average_response_time_ms || 0), 0) / usageData.length)
                  : 0}ms
              </div>
              <p className="text-xs text-slate-500 mt-1">Average time</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="commands">Commands</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Quick links */}
            <div className="flex gap-3 flex-wrap">
              <Link to="/analytics">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 text-sm font-medium transition-colors">
                  <TrendingUp className="w-4 h-4" /> View Analytics <ExternalLink className="w-3 h-3" />
                </div>
              </Link>
              <Link to="/commands">
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-purple-700 text-sm font-medium transition-colors">
                  <Zap className="w-4 h-4" /> Live Commands <ExternalLink className="w-3 h-3" />
                </div>
              </Link>
              <Link to="/mobile">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-green-700 text-sm font-medium transition-colors">
                  🎤 Mobile Voice App <ExternalLink className="w-3 h-3" />
                </div>
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usage Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Client Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="requests" fill="#3b82f6" name="Requests" />
                      <Bar dataKey="quota" fill="#e5e7eb" name="Quota" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Command Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Command Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Commands Feed */}
            {recentCommands.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Zap className="w-4 h-4" /> Recent Activity
                    </CardTitle>
                    <Link to="/commands" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      View all <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentCommands.slice(0, 5).map(cmd => (
                      <div key={cmd.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cmd.status === 'completed' ? 'bg-green-500' : cmd.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                          <div>
                            <p className="text-sm text-slate-800">{cmd.detected_intent?.replace(/_/g, ' ') || 'Processing'}</p>
                            <p className="text-xs text-slate-400 truncate max-w-xs">{cmd.transcription?.substring(0, 60)}</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0 ml-4">
                          {formatDistanceToNow(new Date(cmd.created_date), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="mt-6">
            {showNewClientForm ? (
              <ClientForm 
                onSuccess={() => {
                  setShowNewClientForm(false);
                  refetchClients();
                }}
                onCancel={() => setShowNewClientForm(false)}
              />
            ) : (
              <ClientsList 
                clients={clients}
                loading={clientsLoading}
                onClientSelect={setSelectedClient}
                onRefresh={refetchClients}
              />
            )}
          </TabsContent>

          {/* Commands Tab */}
          <TabsContent value="commands" className="mt-6">
            <CommandHistory commands={recentCommands} />
          </TabsContent>


          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            {selectedClient ? (
              <WidgetConfigurator client={selectedClient} onUpdate={refetchClients} />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-slate-500">
                  Select a client from the Clients tab to configure their widget
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}