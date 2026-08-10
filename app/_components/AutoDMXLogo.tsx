import React from "react";

export type AutoDMXIconProps = {
  className?: string;
};

export type AutoDMXLogoProps = {
  /**
   * 'icon': mark only
   * 'wordmark': text only ("AutoDMX")
   * 'horizontal': mark + text side-by-side
   * 'full': stacked mark + text + tagline
   */
  variant?: "icon" | "wordmark" | "horizontal" | "full";
  className?: string;
  showTagline?: boolean;
};

/**
 * High-fidelity vector SVG icon for AutoDMX (The stylized gradient 'A' with motion speed lines & chat bubble).
 */
export function AutoDMXIcon({ className = "w-8 h-8" }: AutoDMXIconProps) {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="admx-speed-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        <linearGradient id="admx-main-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="35%" stopColor="#8B5CF6" />
          <stop offset="70%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        <linearGradient id="admx-right-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>

        <linearGradient id="admx-swash-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        <filter id="admx-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#7C3AED" floodOpacity="0.35" />
        </filter>

        <filter id="admx-swash-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      <g filter="url(#admx-shadow)">
        {/* Speed lines */}
        <rect x="110" y="175" width="60" height="16" rx="8" fill="url(#admx-speed-grad)" />
        <rect x="75" y="215" width="95" height="18" rx="9" fill="url(#admx-speed-grad)" />
        <rect x="95" y="255" width="75" height="16" rx="8" fill="url(#admx-speed-grad)" />

        {/* Main 'A' Structure */}
        <path
          d="M 260 65 C 275 65, 285 75, 295 95 L 375 270 C 385 292, 375 310, 350 310 L 315 310 C 298 310, 290 298, 283 282 L 260 230 L 237 282 C 230 298, 222 310, 205 310 L 170 310 C 145 310, 135 292, 145 270 L 225 95 C 235 75, 245 65, 260 65 Z"
          fill="url(#admx-main-grad)"
        />

        {/* Right leg highlight */}
        <path
          d="M 260 65 C 275 65, 285 75, 295 95 L 375 270 C 385 292, 375 310, 350 310 L 315 310 C 298 310, 290 298, 283 282 L 260 230 Z"
          fill="url(#admx-right-grad)"
          opacity="0.9"
        />

        {/* Arch Swash */}
        <path
          d="M 152 250 C 200 190, 300 185, 360 235 C 310 210, 225 212, 175 278 Z"
          fill="url(#admx-swash-grad)"
          filter="url(#admx-swash-shadow)"
        />

        {/* Speech Bubble */}
        <g transform="translate(260, 268)">
          <path
            d="M 0 -38 C -32 -38, -55 -18, -55 10 C -55 26, -44 40, -28 49 L -35 70 L -8 57 C -5 58, -2 58, 0 58 C 32 58, 55 38, 55 10 C 55 -18, 32 -38, 0 -38 Z"
            fill="#090A15"
          />
          <circle cx="-18" cy="10" r="6" fill="#38BDF8" />
          <circle cx="0" cy="10" r="6" fill="#818CF8" />
          <circle cx="18" cy="10" r="6" fill="#C084FC" />
        </g>
      </g>
    </svg>
  );
}

/**
 * Official AutoDMX Logo Component supporting multiple variants.
 */
export function AutoDMXLogo({
  variant = "horizontal",
  className = "",
  showTagline = false,
}: AutoDMXLogoProps) {
  if (variant === "icon") {
    return <AutoDMXIcon className={className || "w-8 h-8"} />;
  }

  if (variant === "wordmark") {
    return (
      <span className={`text-[1.15rem] font-bold tracking-tight text-white ${className}`}>
        Auto<span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">DMX</span>
      </span>
    );
  }

  if (variant === "full") {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <AutoDMXIcon className="h-20 w-20 drop-shadow-[0_0_25px_rgba(124,58,237,0.5)]" />
        <div className="mt-3 text-3xl font-extrabold tracking-tight text-white">
          Auto
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            DMX
          </span>
        </div>
        {(showTagline || true) && (
          <div className="mt-2 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-purple-500/50" />
            <span>Automate. Engage. Convert.</span>
            <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-cyan-500/50" />
          </div>
        )}
      </div>
    );
  }

  // Default: "horizontal"
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <AutoDMXIcon className="h-8 w-8 shrink-0 transition-transform duration-300 group-hover:scale-105" />
      <span className="text-[1.15rem] font-bold tracking-tight text-white">
        Auto
        <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          DMX
        </span>
      </span>
    </div>
  );
}
