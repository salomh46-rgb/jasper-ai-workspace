import React from "react";

// RadarCoreIcon: Rotating radar sweep + pulsing central core
export function RadarCoreIcon({ className = "w-8 h-8", color = "#3B82F6" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-full h-full animate-radar-sweep origin-center" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="24" cy="24" r="14" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" />
        <circle cx="24" cy="24" r="6" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1" />
        {/* Sweeper needle with gradient tail */}
        <defs>
          <linearGradient id="radar-beam" x1="24" y1="24" x2="46" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60A5FA" stopOpacity="0.9" />
            <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M24 24 L46 24 A22 22 0 0 0 39.5 8.5 Z" fill="url(#radar-beam)" opacity="0.45" />
        <line x1="24" y1="24" x2="46" y2="24" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {/* Pulsing center green particle */}
      <span className="absolute w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399] animate-ping" />
      <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
    </div>
  );
}

// QuantumCubeIcon: 3D rotating isometric cube wireframe
export function QuantumCubeIcon({ className = "w-6 h-6", color = "#8B5CF6" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-full h-full animate-float-3d" viewBox="0 0 32 32" fill="none">
        <path d="M16 3 L27 9.5 L27 22.5 L16 29 L5 22.5 L5 9.5 Z" stroke={color} strokeWidth="1.2" strokeOpacity="0.7" fill="rgba(139, 92, 246, 0.08)" />
        <path d="M16 3 L16 16 L27 22.5" stroke={color} strokeWidth="1.2" strokeOpacity="0.9" />
        <path d="M16 16 L5 22.5" stroke={color} strokeWidth="1.2" strokeOpacity="0.9" />
        <circle cx="16" cy="16" r="2" fill="#C084FC" className="animate-pulse shadow-[0_0_8px_#C084FC]" />
        <circle cx="27" cy="9.5" r="1.5" fill="#A855F7" />
        <circle cx="5" cy="9.5" r="1.5" fill="#A855F7" />
        <circle cx="16" cy="29" r="1.5" fill="#A855F7" />
      </svg>
    </div>
  );
}

// SpinningGearIcon: Mechanical precision gear
export function SpinningGearIcon({ className = "w-6 h-6", color = "#06B6D4" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-full h-full animate-spin-slow origin-center" viewBox="0 0 32 32" fill="none">
        <path
          d="M14 2h4v3.2a10.05 10.05 0 0 1 2.8 1.15l2.25-2.25 2.83 2.83-2.25 2.25c.48.88.87 1.82 1.15 2.8H28v4h-3.22a10.05 10.05 0 0 1-1.15 2.8l2.25 2.25-2.83 2.83-2.25-2.25a10.05 10.05 0 0 1-2.8 1.15V28h-4v-3.22a10.05 10.05 0 0 1-2.8-1.15l-2.25 2.25-2.83-2.83 2.25-2.25a10.05 10.05 0 0 1-1.15-2.8H2v-4h3.22c.28-.98.67-1.92 1.15-2.8L4.12 6.93l2.83-2.83 2.25 2.25A10.05 10.05 0 0 1 12 5.2V2h2z"
          stroke={color}
          strokeWidth="1.2"
          strokeOpacity="0.85"
          fill="rgba(6, 182, 212, 0.06)"
        />
        <circle cx="16" cy="16" r="4" stroke={color} strokeWidth="1.5" />
        <circle cx="16" cy="16" r="1.5" fill="#22D3EE" className="animate-pulse" />
      </svg>
    </div>
  );
}

// LightningPulseIcon: Electric laser bolt
export function LightningPulseIcon({ className = "w-6 h-6" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-full h-full animate-bounce-subtle" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="lightning-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <filter id="glow-bolt">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path
          d="M18 2 L7 17 L15 17 L13 30 L25 14 L17 14 Z"
          fill="url(#lightning-grad)"
          stroke="#FEF08A"
          strokeWidth="1"
          filter="url(#glow-bolt)"
        />
      </svg>
    </div>
  );
}

// HolographicCloudIcon: 3D levitating cloud with upward beam
export function HolographicCloudIcon({ className = "w-10 h-10" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-full h-full animate-float-3d" viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id="cloud-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path
          d="M38 30a7 7 0 0 0-1.8-13.8 11 11 0 0 0-20.4-3.2A8 8 0 0 0 8 28a8 8 0 0 0 8 8h22a7 7 0 0 0 0-14z"
          stroke="url(#cloud-grad)"
          strokeWidth="1.5"
          fill="rgba(192, 132, 252, 0.08)"
        />
        {/* Upload beam arrow */}
        <path d="M24 38 L24 22 M18 27 L24 21 L30 27" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
        <circle cx="24" cy="20" r="1.5" fill="#E879F9" className="animate-ping" />
      </svg>
    </div>
  );
}

// NeuralSynapseIcon: Interconnected pulsing synaptic mesh
export function NeuralSynapseIcon({ className = "w-6 h-6", color = "#60A5FA" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="3.5" fill="rgba(59, 130, 246, 0.2)" stroke="#3B82F6" strokeWidth="1.2" />
        <circle cx="16" cy="16" r="1.5" fill="#93C5FD" className="animate-ping" />
        
        <circle cx="6" cy="9" r="2" fill="#8B5CF6" />
        <circle cx="26" cy="8" r="2" fill="#06B6D4" />
        <circle cx="7" cy="24" r="2" fill="#10B981" />
        <circle cx="25" cy="23" r="2" fill="#F59E0B" />

        <line x1="6" y1="9" x2="16" y2="16" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="26" y1="8" x2="16" y2="16" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="7" y1="24" x2="16" y2="16" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="25" y1="23" x2="16" y2="16" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    </div>
  );
}

// IsometricLayersIcon: 3D data plate stack
export function IsometricLayersIcon({ className = "w-6 h-6", color = "#10B981" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-full h-full animate-float-3d" viewBox="0 0 32 32" fill="none">
        <path d="M16 3 L28 9 L16 15 L4 9 Z" fill="rgba(16, 185, 129, 0.2)" stroke={color} strokeWidth="1.2" />
        <path d="M4 14 L16 20 L28 14" stroke={color} strokeWidth="1.2" strokeOpacity="0.7" />
        <path d="M4 19 L16 25 L28 19" stroke={color} strokeWidth="1.2" strokeOpacity="0.9" />
        <circle cx="16" cy="9" r="1.5" fill="#34D399" className="animate-pulse" />
      </svg>
    </div>
  );
}
