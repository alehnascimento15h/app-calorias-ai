import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface OptionCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
}

export function OptionCard({ icon, title, description, selected, onClick }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left',
        'hover:scale-[1.02] active:scale-[0.98]',
        selected 
          ? 'bg-black text-white border-black' 
          : 'bg-white text-black border-gray-200 hover:border-gray-400'
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'text-3xl flex-shrink-0',
          selected ? 'opacity-100' : 'opacity-70'
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          {description && (
            <p className={cn(
              'text-sm',
              selected ? 'text-gray-300' : 'text-gray-600'
            )}>
              {description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
