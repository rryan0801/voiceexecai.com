import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Shield, Copy, Check } from 'lucide-react';
import NavBar from '@/components/NavBar';

export default function ObjectionPreFlight() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const { data: prospects = [] } = useQuery({
    queryKey: ['prospects-objections'],
    queryFn: () => base44.entities.Prospect.list('-updated_date', 100),
    initialData: []
  });

  const filteredProspects = prospects.filter(p =>
    p.prospect_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePredict = async (prospectId) => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('predictObjections', {
        prospect_id: prospectId,
        client_id: 'default'
      });
      setPredictions(res.data);
      const prospect = prospects.find(p => p.id === prospectId);
      setSelectedProspect(prospect);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Objection Pre-Flight</h1>
          </div>
          <p className="text-slate-500 ml-13">Predict objections before the call—with ready rebuttals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prospect List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select Prospect</CardTitle>
              <Input
                placeholder="Search by name or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-3"
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredProspects.map(prospect => (
                  <div
                    key={prospect.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedProspect?.id === prospect.id
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-semibold text-sm text-slate-900">{prospect.prospect_name}</p>
                    <p className="text-xs text-slate-500">{prospect.company_name}</p>
                    <Button
                      size="sm"
                      onClick={() => handlePredict(prospect.id)}
                      disabled={loading}
                      className="w-full mt-2 bg-orange-600 hover:bg-orange-700"
                    >
                      {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                      Get Objections
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Predictions */}
          {predictions ? (
            <div className="space-y-3">
              {predictions.objections?.map((obj, i) => (
                <Card key={i} className="border-orange-200 bg-orange-50">
                  <CardContent className="pt-4 pb-4">
                    <div className="mb-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-slate-900">"{obj.objection}"</h4>
                        <Badge className="bg-red-100 text-red-800">{obj.likelihood}%</Badge>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{obj.reason}</p>
                      <p className="text-xs text-slate-500">
                        Successfully handled in {obj.similar_closed_deals} closed deals
                      </p>
                    </div>

                    {/* Rebuttal */}
                    <div className="bg-white rounded-lg p-3 border-l-4 border-green-500 mb-2">
                      <p className="text-xs text-slate-500 mb-1">Say this:</p>
                      <p className="text-sm font-medium text-slate-900 italic">"{obj.rebuttal}"</p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(obj.rebuttal, i)}
                      className="w-full gap-2"
                    >
                      {copiedId === i ? (
                        <>
                          <Check className="w-3 h-3 text-green-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Rebuttal
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center text-slate-400">
                <Shield className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                Select a prospect to see predicted objections
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}