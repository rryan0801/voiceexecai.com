import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Phone, Search } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import NavBar from '@/components/NavBar';

export default function SMSThreads() {
  const [selectedThread, setSelectedThread] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: threads = [], refetch } = useQuery({
    queryKey: ['sms-threads'],
    queryFn: () => base44.entities.SMSThread.list('-last_message_at', 200),
    initialData: [],
    refetchInterval: 10000
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedThread?.messages]);

  const filteredThreads = threads.filter(t =>
    t.prospect_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.prospect_phone.includes(searchTerm)
  );

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedThread) return;

    setSending(true);
    try {
      await base44.functions.invoke('sendSMSMessage', {
        thread_id: selectedThread.id,
        message_content: messageInput,
        prospect_phone: selectedThread.prospect_phone
      });
      setMessageInput('');
      setTimeout(() => refetch(), 500);
    } finally {
      setSending(false);
    }
  };

  const activeThreads = threads.filter(t => t.status === 'active').length;
  const totalMessages = threads.reduce((sum, t) => sum + (t.total_messages || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">SMS Conversations</h1>
          </div>
          <p className="text-slate-500 ml-13">Two-way SMS threading with prospect tracking</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{threads.length}</p>
                  <p className="text-xs text-slate-500">Total Threads</p>
                </div>
                <MessageCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{activeThreads}</p>
                  <p className="text-xs text-slate-500">Active</p>
                </div>
                <Phone className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{totalMessages}</p>
                  <p className="text-xs text-slate-500">Messages</p>
                </div>
                <Send className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thread List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredThreads.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">No threads found</p>
                  ) : (
                    filteredThreads.map(thread => (
                      <div
                        key={thread.id}
                        onClick={() => setSelectedThread(thread)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedThread?.id === thread.id
                            ? 'border-green-300 bg-green-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm text-slate-900">
                            {thread.prospect_name}
                          </p>
                          {thread.last_message_from === 'prospect' && (
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-mono">{thread.prospect_phone}</p>
                        <p className="text-xs text-slate-600 truncate mt-1">
                          {thread.messages?.[thread.messages.length - 1]?.content || 'No messages'}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {thread.total_messages} msgs
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat View */}
          {selectedThread ? (
            <div className="lg:col-span-2">
              <Card className="border-green-200 flex flex-col h-full" style={{ minHeight: '500px' }}>
                {/* Header */}
                <CardHeader className="border-b pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{selectedThread.prospect_name}</CardTitle>
                      <p className="text-xs text-slate-500 font-mono">{selectedThread.prospect_phone}</p>
                    </div>
                    <Badge className={
                      selectedThread.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-600'
                    }>
                      {selectedThread.status}
                    </Badge>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedThread.messages?.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.direction === 'outbound'
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.direction === 'outbound' ? 'text-green-100' : 'text-slate-500'
                        }`}>
                          {format(new Date(msg.timestamp), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Input */}
                <div className="border-t p-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={sending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sending || !messageInput.trim()}
                      className="bg-green-600 hover:bg-green-700 gap-2"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedThread.total_messages} messages in thread
                  </p>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="lg:col-span-2 border-dashed">
              <CardContent className="pt-12 pb-12 text-center text-slate-400">
                <MessageCircle className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                <p>Select a conversation to reply</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}