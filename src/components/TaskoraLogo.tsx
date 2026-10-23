import React from 'react';

interface TaskoraLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export const TaskoraLogo: React.FC<TaskoraLogoProps> = ({
  className = '',
  size = 32,
  showText = true,
  textClassName = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* Taskora AI Geometric Emblem */}
      <div 
        className="relative shrink-0 flex items-center justify-center rounded-xl p-1 bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent border border-white/15 shadow-[0_0_20px_-3px_rgba(139,92,246,0.5)] transition-all"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="taskora-grad-1" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="taskora-grad-2" x1="36" y1="4" x2="4" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <filter id="taskora-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background subtle polygon contour */}
          <polygon
            points="20,4 34,12 34,28 20,36 6,28 6,12"
            fill="rgba(10, 10, 10, 0.6)"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.2"
          />

          {/* Precision Weave 'T' Emblem: Top horizontal crossbar */}
          <path
            d="M9 13.5C9 12.1193 10.1193 11 11.5 11H28.5C29.8807 11 31 12.1193 31 13.5C31 14.8807 29.8807 16 28.5 16H11.5C10.1193 16 9 14.8807 9 13.5Z"
            fill="url(#taskora-grad-1)"
          />

          {/* Vertical stem of 'T' tapering down with garment needle precision */}
          <path
            d="M17.5 16H22.5V26.5L20 30L17.5 26.5V16Z"
            fill="url(#taskora-grad-2)"
          />

          {/* Neural Connection Nodes */}
          <circle cx="11.5" cy="13.5" r="1.5" fill="#FFFFFF" />
          <circle cx="28.5" cy="13.5" r="1.5" fill="#22D3EE" />
          <circle cx="20" cy="20" r="1.75" fill="#FFFFFF" filter="url(#taskora-glow)" />
          <circle cx="20" cy="30" r="1.25" fill="#10B981" />

          {/* Fiber stitch lines across T */}
          <line x1="14" y1="13.5" x2="26" y2="13.5" stroke="#FFFFFF" strokeWidth="0.8" strokeDasharray="1.5 1.5" opacity="0.85" />
          <line x1="20" y1="17" x2="20" y2="25" stroke="#FFFFFF" strokeWidth="0.8" strokeDasharray="1.5 1.5" opacity="0.85" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex items-center gap-2">
          <div className="flex items-baseline">
            <span className={`font-serif-instrument tracking-tight text-white font-normal ${textClassName || 'text-xl sm:text-2xl'}`}>
              Taskora
            </span>
            <span className="ml-1 text-xs font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#06B6D4] to-[#10B981]">
              AI
            </span>
          </div>
          <span className="hidden md:inline-block font-mono text-[9px] uppercase tracking-widest text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/20 px-2 py-0.5 rounded-full">
            Garment Neural OS
          </span>
        </div>
      )}
    </div>
  );
};
