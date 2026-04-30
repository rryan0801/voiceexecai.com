import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Plus, MessageSquare, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import NavBar from '@/components/NavBar';

export default function DealCollaborationRooms() {
  const [creating, setCreating] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [dealId, setDealId] = useState('');
  const [prospectId, setProspectId] = useState('');
  const [prospectName, setProspectName] = useState('');

  const { data: rooms = [], refetch } = useQuery({
    queryKey: ['deal-rooms'],
    queryFn: () => base44.entities.DealRoom.list('-created_at', 50),
    initialData: []
  });

  const handleCreateRoom = async () => {
    if (!dealId || !prospectName) return;
    setCreating(true);
    try {
      await base44.functions.invoke('createDealRoom', {
        deal_id: dealId,
        prospect_id: prospectId,
        client_id: 'default',
        prospect_name: prospectName,
        collaborators: []
      });
      setTimeout(() => refetch(), 1000);
      setDealId('');
      setProspectId('');
      setProspectName('');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Deal Rooms</h1>
            </div>
            <p className="text-slate-500 ml-13">Collaborative deal workspace with strategy & timeline</p>
          </div>
          <Button className="bg-pink-600 hover:bg-pink-700 gap-2">
            <Plus className="w-4 h-4" /> New Room
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Create Room</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Deal ID" value={dealId} onChange={(e) => setDealId(e.target.value)} />
              <Input placeholder="Prospect ID" value={prospectId} onChange={(e) => setProspectId(e.target.value)} />
              <Input placeholder="Prospect Name" value={prospectName} onChange={(e) => setProspectName(e.target.value)} />
              <Button
                onClick={handleCreateRoom}
                disabled={creating || !dealId || !prospectName}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Room
              </Button>
            </CardContent>
          </Card>

          {/* Rooms List */}
          <div className="lg:col-span-2 space-y-3">
            {rooms.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-slate-400">
                  Create a deal room to get started
                </CardContent>
              </Card>
            ) : (
              rooms.map(room => (
                <Card
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`cursor-pointer transition-all ${
                    selectedRoom?.id === room.id ? 'border-pink-300 bg-pink-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">{room.prospect_name}</p>
                        <p className="text-xs text-slate-500">Close target: {room.timeline?.target_close}</p>
                      </div>
                      <Badge className="bg-pink-100 text-pink-800">
                        {room.collaborators?.length || 0} collab.
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{room.strategy}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Room Detail */}
        {selectedRoom && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedRoom.prospect_name}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">Created {formatDistanceToNow(new Date(selectedRoom.created_at), { addSuffix: true })}</p>
                </div>
                <Users className="w-5 h-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded p-3">
                  <p className="text-xs text-slate-500">Target Close</p>
                  <p className="font-bold text-slate-900">{selectedRoom.timeline?.target_close}</p>
                </div>
                <div className="bg-slate-50 rounded p-3">
                  <p className="text-xs text-slate-500">Days to Close</p>
                  <p className="font-bold text-slate-900">{selectedRoom.timeline?.estimated_days_to_close}d</p>
                </div>
                <div className="bg-slate-50 rounded p-3">
                  <p className="text-xs text-slate-500">Collaborators</p>
                  <p className="font-bold text-slate-900">{selectedRoom.collaborators?.length || 0}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900 mb-2">Strategy</p>
                <p className="text-sm text-slate-700">{selectedRoom.strategy}</p>
              </div>

              {selectedRoom.notes && selectedRoom.notes.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" /> Notes ({selectedRoom.notes.length})
                  </p>
                  <div className="space-y-2">
                    {selectedRoom.notes.slice(0, 3).map((note, i) => (
                      <div key={i} className="bg-slate-50 rounded p-2">
                        <p className="text-xs text-slate-500">{note.author}</p>
                        <p className="text-sm text-slate-700">{note.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full bg-pink-600 hover:bg-pink-700">Open Room</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}