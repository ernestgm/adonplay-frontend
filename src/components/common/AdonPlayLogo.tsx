import React from "react";

export default function AdonPlayLogo() {
  return (
    <div className="flex items-center gap-4" aria-label="AdonPlay">
      <svg
        aria-hidden="true"
        className="h-[76px] w-[76px] shrink-0"
        viewBox="0 0 76 76"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="adonplay-logo-gradient" x1="12" y1="10" x2="66" y2="67" gradientUnits="userSpaceOnUse">
            <stop stopColor="#56D7FF" />
            <stop offset="0.5" stopColor="#4384FF" />
            <stop offset="1" stopColor="#C05CFF" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="74" height="74" rx="24" fill="white" fillOpacity="0.08" />
        <rect x="1" y="1" width="74" height="74" rx="24" stroke="white" strokeOpacity="0.22" />
        <path
          d="M16 29.5C21.85 20.82 31.75 16 42.25 16C52.08 16 60.9 20.23 66.86 27.87"
          stroke="url(#adonplay-logo-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M13.7 43.5C14.83 51.53 18.96 58.48 25.07 63.28"
          stroke="url(#adonplay-logo-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M62.3 43.5C61.35 50.25 58.2 56.25 53.5 60.8"
          stroke="url(#adonplay-logo-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M31 27.5L54.5 44L31 60.5V27.5Z" fill="white" />
      </svg>

      <div className="flex flex-col">
        <span className="text-[2rem] font-semibold leading-none tracking-[-0.055em] text-white">
          Adon<span className="text-brand-300">Play</span>
        </span>
        <span className="mt-2 text-[0.63rem] font-medium uppercase tracking-[0.28em] text-white/55">
          digital display network
        </span>
      </div>
    </div>
  );
}
