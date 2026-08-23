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
 * Minimalist Apple-inspired geometric vector icon for AutoDMX.
 * Clean, high-precision geometry that looks pristine in dark and light modes.
 */
export function AutoDMXIcon({ className = "w-7 h-7" }: AutoDMXIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer rounded minimal container / badge */}
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        className="fill-neutral-900 stroke-neutral-800 dark:fill-white dark:stroke-neutral-200"
      />
      {/* Precision geometric 'A' & DM swash */}
      <path
        d="M16 8L22 22H18.5L16 16.5L13.5 22H10L16 8Z"
        className="fill-white dark:fill-neutral-950"
      />
      <circle
        cx="16"
        cy="19"
        r="1.25"
        className="fill-neutral-400 dark:fill-neutral-600"
      />
      {/* Speed / DM lines */}
      <rect
        x="6.5"
        y="13"
        width="3"
        height="1.5"
        rx="0.75"
        className="fill-white/80 dark:fill-neutral-950/80"
      />
      <rect
        x="5.5"
        y="16.5"
        width="4"
        height="1.5"
        rx="0.75"
        className="fill-white/80 dark:fill-neutral-950/80"
      />
    </svg>
  );
}

/**
 * Official AutoDMX Logo Component supporting multiple variants.
 * Refined monochromatic Apple aesthetic.
 */
export function AutoDMXLogo({
  variant = "horizontal",
  className = "",
  showTagline = false,
}: AutoDMXLogoProps) {
  if (variant === "icon") {
    return <AutoDMXIcon className={className || "w-7 h-7"} />;
  }

  if (variant === "wordmark") {
    return (
      <span
        className={`text-[1.125rem] font-semibold tracking-tight text-neutral-900 dark:text-white ${className}`}
      >
        Auto<span className="text-neutral-500 dark:text-neutral-400 font-normal">DMX</span>
      </span>
    );
  }

  if (variant === "full") {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <AutoDMXIcon className="h-14 w-14 drop-shadow-sm" />
        <div className="mt-3.5 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Auto<span className="font-normal text-neutral-500 dark:text-neutral-400">DMX</span>
        </div>
        {(showTagline || true) && (
          <div className="mt-1.5 flex items-center gap-2.5 text-[11px] font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            <span className="h-px w-6 bg-neutral-300 dark:bg-neutral-800" />
            <span>Automate · Engage · Convert</span>
            <span className="h-px w-6 bg-neutral-300 dark:bg-neutral-800" />
          </div>
        )}
      </div>
    );
  }

  // Default: "horizontal"
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <AutoDMXIcon className="h-7 w-7 shrink-0 transition-transform duration-200 group-hover:scale-105" />
      <span className="text-[1.05rem] font-semibold tracking-tight text-neutral-900 dark:text-white">
        Auto<span className="font-normal text-neutral-500 dark:text-neutral-400">DMX</span>
      </span>
    </div>
  );
}
