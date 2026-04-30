import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const CONNECTOR_ID = '69efbb8b3d25346a6ed84481'; // myOutlook

export default function OutlookConnectBanner({ onStatusChange }) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const checkConnection = async () => {
    try {
      await base44.functions.invoke('checkOutlookConnection', {});
      setConnected(true);
      onStatusChange?.(true);
    } catch {
      setConnected(false);
      onStatusChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setConnecting(false);
        checkConnection();
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    await base44.connectors.disconnectAppUser(CONNECTOR_ID);
    setConnected(false);
    onStatusChange?.(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg text-sm text-slate-500 mb-6">
        <Loader2 className="w-4 h-4 animate-spin" /> Checking Outlook connection...
      </div>
    );
  }

  if (connected) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg mb-6">
        <div className="flex items-center gap-2 text-green-800 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Outlook connected — emails will be sent from your account
        </div>
        <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-green-700 hover:text-red-600 text-xs">
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
      <div className="flex items-center gap-3">
        <Mail className="w-5 h-5 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Connect your Outlook to send emails</p>
          <p className="text-xs text-amber-700">Voice commands won't send real emails until connected</p>
        </div>
      </div>
      <Button
        onClick={handleConnect}
        disabled={connecting}
        size="sm"
        className="bg-amber-600 hover:bg-amber-700 text-white"
      >
        {connecting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
        Connect Outlook
      </Button>
    </div>
  );
}