import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Copy, Settings, BarChart3, Zap, RefreshCw, TrendingUp, ExternalLink, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import ClientsList from '@/components/dashboard/ClientsList';
import ClientForm from '@/components/dashboard/ClientForm';
import WidgetConfigurator from '@/components/dashboard/WidgetConfigurator';
import CommandHistory from '@/components/dashboard/CommandHistory';
import NavBar from '@/components/NavBar';
import QuickTestRunner from '@/components/dashboard/QuickTestRunner';
import GettingStarted from '@/components/dashboard/GettingStarted';

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
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage clients and monitor API usage</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setShowNewClientForm(true)}
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg"
            >
              <Sparkles className="w-4 h-4 mr-2" /> + New Client
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { title: 'Total Clients', value: clients.length, subtext: `${activeClients} active`, color: 'from-blue-500 to-cyan-500', icon: '👥' },
            { title: 'Total Requests', value: totalRequests, subtext: 'This month', color: 'from-violet-500 to-purple-500', icon: '⚡' },
            { title: 'Success Rate', value: totalRequests > 0 ? Math.round(((totalRequests - failedRequests) / totalRequests) * 100) : 0, subtext: `${failedRequests} failed`, color: 'from-green-500 to-emerald-500', icon: '✓', suffix: '%' },
            { title: 'Avg Response', value: usageData.length > 0 ? Math.round(usageData.reduce((sum, u) => sum + (u.average_response_time_ms || 0), 0) / usageData.length) : 0, subtext: 'Average time', color: 'from-orange-500 to-amber-500', icon: '⏱️', suffix: 'ms' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <span className="text-lg">{stat.icon}</span>
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {stat.value}{stat.suffix || ''}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-violet-600 data-[state=active]:text-white transition-all">Overview</TabsTrigger>
              <TabsTrigger value="clients" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-violet-600 data-[state=active]:text-white transition-all">Clients</TabsTrigger>
              <TabsTrigger value="commands" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-violet-600 data-[state=active]:text-white transition-all">Commands</TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-violet-600 data-[state=active]:text-white transition-all">Settings</TabsTrigger>
            </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">

            {/* Getting Started — shown when no clients yet */}
            {!clientsLoading && clients.length === 0 && (
              <GettingStarted
                hasClients={clients.length > 0}
                onCreateClient={() => { setActiveTab('clients'); setShowNewClientForm(true); }}
              />
            )}

            {/* Quick links */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex gap-3 flex-wrap"
            >
              {[
                { to: '/analytics', icon: TrendingUp, text: 'View Analytics', color: 'from-blue-500 to-cyan-500' },
                { to: '/commands', icon: Zap, text: 'Live Commands', color: 'from-violet-500 to-purple-500' },
                { to: '/mobile', icon: null, text: '🎤 Mobile Voice App', color: 'from-green-500 to-emerald-500' }
              ].map((link, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to={link.to}>
                    <div className={`flex items-center gap-2 px-5 py-3 bg-gradient-to-r ${link.color} text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all`}>
                      {link.icon && <link.icon className="w-4 h-4" />}
                      {link.text}
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            {/* Charts — only show when there's data */}
            {clients.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Usage Chart */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <Card className="shadow-lg border-0 hover:shadow-xl transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-white" />
                        </div>
                        Client Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{fontSize: 11}} />
                          <YAxis />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                              border: 'none', 
                              borderRadius: '12px', 
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                            }} 
                          />
                          <Legend />
                          <Bar dataKey="requests" fill="url(#colorRequests)" name="Requests" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="quota" fill="#e2e8f0" name="Quota" radius={[4, 4, 0, 0]} />
                          <defs>
                            <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4}/>
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Command Status */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <Card className="shadow-lg border-0 hover:shadow-xl transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
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
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={90}
                            innerRadius={40}
                            fill="#8884d8"
                            dataKey="value"
                            strokeWidth={3}
                            stroke="#fff"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                              border: 'none', 
                              borderRadius: '12px', 
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                            }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {/* Quick Test Runner */}
            {clients.length > 0 && <QuickTestRunner />}

            {/* Recent Commands Feed */}
            {recentCommands.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <Card className="shadow-lg border-0 hover:shadow-xl transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2.5 text-base">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center">
                          <Zap className="w-3.5 h-3.5 text-white" />
                        </div>
                        Recent Activity
                      </CardTitle>
                      <Link to="/commands" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium">
                        View all <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2.5">
                      {recentCommands.slice(0, 5).map((cmd, i) => (
                        <motion.div 
                          key={cmd.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.8 + i * 0.05 }}
                          className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                        >
                          <div className="flex items-center gap-3">
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cmd.status === 'completed' ? 'bg-green-500' : cmd.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`} 
                            />
                            <div>
                              <p className="text-sm font-medium text-slate-800">{cmd.detected_intent?.replace(/_/g, ' ') || 'Processing'}</p>
                              <p className="text-xs text-slate-500 truncate max-w-xs">{cmd.transcription?.substring(0, 60)}</p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400 flex-shrink-0 ml-4 font-medium">
                            {formatDistanceToNow(new Date(cmd.created_date), { addSuffix: true })}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
            ) : clients.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Widget Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-slate-500 text-sm">Select a client to configure their widget:</p>
                  {clients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => { setSelectedClient(client); }}
                      className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{client.company_name}</p>
                        <p className="text-xs text-slate-400">{client.status}</p>
                      </div>
                      <Settings className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-slate-500">
                  No clients yet. Create a client first from the Clients tab.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        </motion.div>
      </div>
    </div>
  );
}