import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
  iconColor = 'text-slate-300',
  iconBg = 'bg-slate-100',
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {Icon != null && (
        <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center mb-5`}>
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        {actionLabel && (
          onAction ? (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {actionLabel} <ArrowRight className="w-4 h-4" />
            </button>
          ) : actionHref ? (
            <Link
              to={actionHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {actionLabel} <ArrowRight className="w-4 h-4" />
            </Link>
          ) : null
        )}
        {secondaryLabel && secondaryHref && (
          <Link
            to={secondaryHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}