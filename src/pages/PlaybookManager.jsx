import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Plus, Play, TrendingUp } from 'lucide-react';
import NavBar from '@/components/NavBar';

export default function PlaybookManager() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    deal_stage: 'prospecting',
    steps: []
  });

  const { data: playbooks = [], refetch } = useQuery({
    queryKey: ['playbooks'],
    queryFn: () => base44.entities.Playbook.list('-created_at', 100),
    initialData: []
  });

  const handleCreate = async () => {
    if (!formData.name) return;
    const user = await base44.auth.me();
    await base44.entities.Playbook.create({
      ...formData,
      manager_email: user.email,
      client_id: 'default',
      created_at: new Date().toISOString()
    });
    setFormData({ name: '', description: '', industry: '', deal_stage: 'prospecting', steps: [] });
    setShowForm(false);
    refetch();
  };

  const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closing'];

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Sales Playbooks</h1>
            </div>
            <p className="text-slate-500 ml-13">Proven sequences for your team to follow</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" /> New Playbook
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6 border-indigo-200 bg-indigo-50">
            <CardContent className="pt-6 space-y-3">
              <Input
                placeholder="Playbook name (e.g., Q2 Enterprise Close)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                placeholder="Target industry (optional)"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
              <select
                value={formData.deal_stage}
                onChange={(e) => setFormData({ ...formData, deal_stage: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {stages.map(s => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700">
                  Create Playbook
                </Button>
                <Button onClick={() => setShowForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playbooks.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="pt-12 pb-12 text-center text-slate-400">
                <BookOpen className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                No playbooks yet. Create one to get started.
              </CardContent>
            </Card>
          ) : (
            playbooks.map(playbook => (
              <Card
                key={playbook.id}
                onClick={() => setSelectedPlaybook(playbook)}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{playbook.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600">{playbook.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-blue-100 text-blue-800">
                      {playbook.deal_stage}
                    </Badge>
                    {playbook.industry && (
                      <Badge className="bg-purple-100 text-purple-800">
                        {playbook.industry}
                      </Badge>
                    )}
                    {playbook.success_rate && (
                      <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {playbook.success_rate}%
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {playbook.steps?.length || 0} steps · Used {playbook.usage_count || 0}x
                  </div>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2" size="sm">
                    <Play className="w-3 h-3" /> Use This Playbook
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}