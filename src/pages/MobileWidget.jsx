import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import VoiceWidget from '@/components/VoiceWidget';

export default function MobileWidget() {
  const [clientId, setClientId] = useState(null);

  // Load first active client
  useEffect(() => {
    base44.entities.Client.filter({ status: 'active' }, '-created_date', 1).then(clients => {
      if (clients.length > 0) setClientId(clients[0].id);
    });
  }, []);

  const voiceConfig = {
    clientId,
    title: 'VoiceRep AI',
    subtitle: 'Speak your sales action',
    footer: 'VoiceRep AI • Sales Rep Edition',
    contextFields: [
      { name: 'prospect_name', placeholder: 'Prospect name' },
      { name: 'prospect_company', placeholder: 'Company' }
    ],
    onSuccess: (data) => {
      console.log('Voice command succeeded:', data);
    },
    onError: (msg) => {
      console.error('Voice command error:', msg);
    }
  };

  if (!clientId) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  }

  return <VoiceWidget config={voiceConfig} />;
}