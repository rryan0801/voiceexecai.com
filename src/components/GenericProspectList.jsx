/**
 * Generic Prospect List Component
 * 
 * Works with any prospect entity schema via EntityAdapter
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Mail, Phone, Search, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import EntityAdapter from '@/lib/entityAdapter';

export default function GenericProspectList({ onProspectSelect = () => {} }) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: prospects = [] } = useQuery({
    queryKey: ['prospects-generic'],
    queryFn: () => EntityAdapter.listProspects({}, '-updated_date', 100),
    initialData: []
  });

  const filteredProspects = prospects.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Prospects
          </CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredProspects.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No prospects found</p>
            ) : (
              filteredProspects.map(prospect => (
                <div
                  key={prospect.id}
                  onClick={() => onProspectSelect(prospect)}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{prospect.name}</h3>
                      <p className="text-sm text-slate-600">{prospect.company}</p>
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
                    {prospect.updated_date && (
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-4">
                        {formatDistanceToNow(new Date(prospect.updated_date), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}