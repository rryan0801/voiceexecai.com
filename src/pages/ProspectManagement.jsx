import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { Users, Mail, Phone, Pencil, Check, X } from 'lucide-react';
import OutlookConnectBanner from '@/components/OutlookConnectBanner';
import NavBar from '@/components/NavBar';

export default function ProspectManagement() {
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  // Fetch prospects
  const { data: prospects = [], refetch } = useQuery({
    queryKey: ['prospects'],
    queryFn: () => base44.entities.Prospect.list('-updated_date', 100),
    initialData: []
  });

  // Fetch interactions for selected prospect
  const { data: interactions = [] } = useQuery({
    queryKey: ['interactions', selectedProspect?.id],
    queryFn: () => {
      if (!selectedProspect) return [];
      return base44.entities.ProspectInteraction.filter({
        prospect_id: selectedProspect.id
      }, '-created_date', 20);
    },
    initialData: [],
    enabled: !!selectedProspect
  });

  const saveEmail = async () => {
    setSavingEmail(true);
    await base44.entities.Prospect.update(selectedProspect.id, { email: emailValue });
    setSelectedProspect({ ...selectedProspect, email: emailValue });
    setEditingEmail(false);
    setSavingEmail(false);
  };

  const filteredProspects = prospects.filter(p =>
    p.prospect_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Prospect Database</h1>
          <p className="text-slate-500 mt-1">Track interactions and context for each prospect</p>
        </div>

        <OutlookConnectBanner />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prospects List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Prospects
                </CardTitle>
                <Input
                  placeholder="Search by name or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-2"
                />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredProspects.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No prospects yet. Create one via voice command.</p>
                  ) : (
                    filteredProspects.map((prospect) => (
                      <div
                        key={prospect.id}
                        onClick={() => setSelectedProspect(prospect)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedProspect?.id === prospect.id
                            ? 'bg-blue-50 border-blue-300'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">{prospect.prospect_name}</h3>
                            <p className="text-sm text-slate-600">{prospect.company_name}</p>
                            <div className="flex gap-4 mt-2 text-xs text-slate-500">
                              {prospect.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" /> {prospect.email}
                                </span>
                              )}
                              {prospect.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {prospect.phone}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{prospect.interaction_count} interactions</Badge>
                            {prospect.last_interaction_date && (
                              <p className="text-xs text-slate-400 mt-2">
                                {formatDistanceToNow(new Date(prospect.last_interaction_date), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prospect Details & Interactions */}
          <div className="lg:col-span-1">
            {selectedProspect ? (
              <div className="space-y-3">
                {/* Details Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{selectedProspect.prospect_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-slate-600">Company</p>
                      <p className="font-semibold text-slate-900">{selectedProspect.company_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">Email</p>
                      {editingEmail ? (
                        <div className="flex gap-1">
                          <input
                            className="flex-1 text-sm border border-slate-300 rounded px-2 py-1"
                            value={emailValue}
                            onChange={e => setEmailValue(e.target.value)}
                            placeholder="email@company.com"
                            autoFocus
                          />
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveEmail} disabled={savingEmail}>
                            <Check className="w-3 h-3 text-green-600" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingEmail(false)}>
                            <X className="w-3 h-3 text-slate-400" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 break-all text-sm">
                            {selectedProspect.email || <span className="text-slate-400 font-normal">Not set</span>}
                          </p>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setEmailValue(selectedProspect.email || ''); setEditingEmail(true); }}>
                            <Pencil className="w-3 h-3 text-slate-400" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {selectedProspect.phone && (
                      <div>
                        <p className="text-slate-600">Phone</p>
                        <p className="font-semibold text-slate-900">{selectedProspect.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-slate-600">Total Interactions</p>
                      <p className="font-semibold text-slate-900">{selectedProspect.interaction_count}</p>
                    </div>
                    {selectedProspect.notes && (
                      <div className="border-t pt-3">
                        <p className="text-slate-600 text-xs mb-1">Notes</p>
                        <p className="text-slate-700 italic">{selectedProspect.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Interactions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Recent Interactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {interactions.length === 0 ? (
                      <p className="text-slate-500 text-xs text-center py-4">No interactions yet</p>
                    ) : (
                      <div className="space-y-2">
                        {interactions.map((interaction) => (
                          <div key={interaction.id} className="border-b pb-2 last:border-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <Badge variant="outline" className="text-xs mb-1">
                                  {interaction.interaction_type}
                                </Badge>
                                <p className="text-xs text-slate-700">{interaction.summary}</p>
                              </div>
                              <p className="text-xs text-slate-400 ml-2 whitespace-nowrap">
                                {formatDistanceToNow(new Date(interaction.created_date), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-slate-500 text-sm">
                  Select a prospect to view details
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}