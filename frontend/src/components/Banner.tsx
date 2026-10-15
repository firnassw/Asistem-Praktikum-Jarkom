import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';

export type BannerVariant = 'warning' | 'error' | 'success' | 'info';

interface BannerProps {
  variant?: BannerVariant;
  pesan: string;
  kode?: string;
  onClose?: () => void;
}

const variantStyles: Record<
  BannerVariant,
  { bg: string; text: string; border: string; icon: React.FC<{ size?: number; className?: string }> }
> = {
  warning: {
    bg: 'bg-[#FFF4D6]',
    text: 'text-[#8A5A00]',
    border: 'border-[#8A5A00]/30',
    icon: AlertTriangle,
  },
  error: {
    bg: 'bg-[#FCE8E6]',
    text: 'text-[#B3261E]',
    border: 'border-[#B3261E]/30',
    icon: AlertCircle,
  },
  success: {
    bg: 'bg-[#E3F4EA]',
    text: 'text-[#16794C]',
    border: 'border-[#16794C]/30',
    icon: CheckCircle,
  },
  info: {
    bg: 'bg-[#E3F4FE]',
    text: 'text-[#1F1E22]',
    border: 'border-[#8BD0FC]/40',
    icon: Info,
  },
};

export const Banner: React.FC<BannerProps> = ({
  variant = 'warning',
  pesan,
  kode,
  onClose,
}) => {
  const current = variantStyles[variant];
  const IconComponent = current.icon;

  return (
    <div
      role="alert"
      className={`w-full rounded-[14px] border ${current.border} ${current.bg} ${current.text} p-4 flex items-start justify-between gap-3 shadow-xs transition-all`}
    >
      <div className="flex items-start gap-3">
        <IconComponent size={20} className="shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          {kode && (
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider opacity-80">
              {kode}
            </span>
          )}
          <p className="font-sans text-[14px] font-semibold leading-relaxed">
            {pesan}
          </p>
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          aria-label="Tutup pemberitahuan"
          className="text-current opacity-70 hover:opacity-100 p-1 rounded-md transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
};
