import React from 'react';
import { PackageOpen, Sparkles, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  icon,
}) => {
  return (
    <div className="py-16 px-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 mx-auto mb-4">
        {icon || <PackageOpen className="w-8 h-8 stroke-1" />}
      </div>
      <h3 className="text-lg font-bold text-neutral-900 tracking-tight mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed mb-6">{description}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="w-full sm:w-auto px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            {actionText}
          </button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="w-full sm:w-auto px-4 py-2.5 border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-xl transition-colors"
          >
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  );
};
