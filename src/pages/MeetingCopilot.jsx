import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Phone, Target, AlertCircle, TrendingUp } from 'lucide-react';
import NavBar from '@/components/NavBar';

export default function MeetingCopilot() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: prospects = [] } = useQuery({
    queryKey: ['prospects-copilot'],
    queryFn: () => base44.entities.Prospect.list('-updated_date', 200),
    initialData: []
  });

  const handleGetIntel = async (prospectId, prospectName) => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('prepMeetingIntel', {
        prospect_id: prospectId,
        prospect_name: prospectName
      });
      setIntel(res.intel);
      setSelectedProspect({ id: prospectId, name: prospectName });
    } finally {
      setLoading(false);
    }
  };

  const filteredProspects = prospects.filter(
    p =>
      p.prospect_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-red-600 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Meeting Copilot</h1>
          </div>
          <p className="text-slate-500 ml-13">AI-powered prep for every call — know what to say before you dial</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prospect Search */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select Prospect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Search by name or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredProspects.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No prospects found</p>
                ) : (
                  filteredProspects.map(prospect => (
                    <div
                      key={prospect.id}
                      onClick={() => setSelectedProspect({ id: prospect.id, name: prospect.prospect_name })}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedProspect?.id === prospect.id
                          ? 'border-pink-300 bg-pink-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-semibold text-sm text-slate-900">{prospect.prospect_name}</p>
                      <p className="text-xs text-slate-500">{prospect.company_name}</p>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGetIntel(prospect.id, prospect.prospect_name);
                        }}
                        disabled={loading}
                        className="w-full mt-2 bg-pink-600 hover:bg-pink-700"
                      >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                        Get Call Intel
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Intel Display */}
          {intel && selectedProspect ? (
            <div className="space-y-3">
              {/* Talking Points */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    💬 Key Talking Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {intel.key_talking_points?.map((point, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-lg mt-0.5">✓</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Likely Objections */}
              <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-amber-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    ⚠️ Likely Objections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {intel.objections_likely?.map((obj, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Closing Approach */}
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    🎯 Closing Approach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">{intel.closing_approach}</p>
                </CardContent>
              </Card>

              {/* Win Indicators */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    ✨ Win Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {intel.win_indicators?.map((indicator, i) => (
                      <Badge key={i} className="bg-purple-100 text-purple-800">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center text-slate-400">
                <Target className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                Select a prospect and get call prep intelligence
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}