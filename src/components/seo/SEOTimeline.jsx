import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock } from 'lucide-react';

export default function SEOTimeline({ events }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="space-y-4">
      {events.map((event, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex items-start gap-4"
        >
          <div className="flex flex-col items-center">
            {event.completed ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : event.pending ? (
              <Clock className="w-6 h-6 text-yellow-500" />
            ) : (
              <Circle className="w-6 h-6 text-slate-300" />
            )}
            {idx < events.length - 1 && (
              <div className="w-0.5 h-12 bg-slate-200 my-1" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p className={`font-medium ${event.completed ? 'text-slate-900' : 'text-slate-600'}`}>
              {event.title}
            </p>
            <p className="text-sm text-slate-500 mt-1">{event.description}</p>
            {event.date && (
              <p className="text-xs text-slate-400 mt-1">{event.date}</p>
            )}
            {event.impact && (
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                <TrendingUp className="w-3 h-3" />
                {event.impact}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function TrendingUp({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}