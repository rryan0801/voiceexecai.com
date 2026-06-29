import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Sparkles, Zap, Search, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import toast from 'react-hot-toast';

export default function VoiceCommand({ onClose, onAction }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processCommand(text);
      };

      recognition.start();
      return () => recognition.stop();
    } else {
      toast.error('Speech recognition not supported in this browser');
      onClose();
    }
  }, []);

  const processCommand = async (text) => {
    setIsProcessing(true);
    const lowerText = text.toLowerCase();
    
    try {
      if (lowerText.includes('add') && (lowerText.includes('website') || lowerText.includes('site'))) {
        onAction('add_website', {});
      } else if (lowerText.includes('audit') || lowerText.includes('scan') || lowerText.includes('analyze')) {
        onAction('audit', {});
      } else if (lowerText.includes('keyword') || lowerText.includes('research')) {
        onAction('research', {});
      } else if (lowerText.includes('optimize') || lowerText.includes('fix')) {
        onAction('optimize', {});
      } else if (lowerText.includes('rank') || lowerText.includes('position')) {
        onAction('rankings', {});
      } else {
        toast.success(`Voice command received: "${text}"`);
      }
    } catch (error) {
      toast.error('Command failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const commands = [
    { phrase: 'Add website', action: 'add_website', icon: <Zap className="w-4 h-4" />, color: 'bg-blue-500' },
    { phrase: 'Run audit', action: 'audit', icon: <Search className="w-4 h-4" />, color: 'bg-purple-500' },
    { phrase: 'Research keywords', action: 'research', icon: <TrendingUp className="w-4 h-4" />, color: 'bg-green-500' },
    { phrase: 'Apply fixes', action: 'optimize', icon: <Sparkles className="w-4 h-4" />, color: 'bg-orange-500' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl"
      >
        <div className="relative bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 p-8 text-white text-center">
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
          
          <div className="mb-6">
            <motion.div
              animate={{ scale: isListening ? [1, 1.2, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
            >
              {isListening ? <Mic className="w-10 h-10" /> : <MicOff className="w-10 h-10" />}
            </motion.div>
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Voice Command'}
          </h2>
          <p className="text-white/80 text-sm">
            {isListening ? 'Speak now' : isProcessing ? 'Analyzing your request' : 'Try saying one of these:'}
          </p>

          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-white/20 rounded-lg backdrop-blur"
            >
              <p className="text-sm font-medium">"{transcript}"</p>
            </motion.div>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {commands.map((cmd, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAction(cmd.action, {})}
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
              >
                <div className={`w-10 h-10 rounded-lg ${cmd.color} flex items-center justify-center text-white`}>
                  {cmd.icon}
                </div>
                <span className="font-medium text-sm text-slate-700">{cmd.phrase}</span>
              </motion.button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Or press <kbd className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-mono">/</kbd> anytime to activate voice
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}