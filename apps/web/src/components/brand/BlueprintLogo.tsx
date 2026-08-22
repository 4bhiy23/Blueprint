import * as React from "react";

export function BlueprintLogoIcon({ className = "h-8 w-8", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* ─── Hand-Drawn Wobbly Outer Blueprint Card Badge ─── */}
      <path
        d="M 12 18 C 35 12, 65 14, 88 18 C 92 40, 94 65, 88 84 C 65 90, 35 88, 12 84 C 8 65, 6 40, 12 18 Z"
        fill="#EFF6FF"
        stroke="#0F172A"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ─── Hand-Drawn Offset Ink Shadow ─── */}
      <path
        d="M 16 88 C 38 93, 68 91, 92 86 C 96 66, 94 42, 92 24"
        stroke="#0F172A"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* ─── Node 1: Start (Top Left Handle) ─── */}
      <rect
        x="24"
        y="26"
        width="22"
        height="20"
        rx="4"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth="4.5"
      />
      <circle cx="35" cy="36" r="3.5" fill="#1D4ED8" />

      {/* ─── Node 2: Decision/Choice (Top Right) ─── */}
      <path
        d="M 68 24 L 84 36 L 68 48 L 52 36 Z"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <circle cx="68" cy="36" r="3" fill="#0F172A" />

      {/* ─── Node 3: Form Response (Bottom Center) ─── */}
      <rect
        x="36"
        y="58"
        width="28"
        height="22"
        rx="5"
        fill="#1D4ED8"
        stroke="#0F172A"
        strokeWidth="4.5"
      />
      {/* Checkmark inside response node */}
      <path
        d="M 43 69 L 48 74 L 57 64"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ─── Hand-Drawn Connecting Graph Flow Lines & Arrows ─── */}
      {/* Line Node 1 -> Node 2 */}
      <path
        d="M 46 36 C 49 34, 50 37, 52 36"
        stroke="#1D4ED8"
        strokeWidth="4"
        strokeDasharray="3 3"
        strokeLinecap="round"
      />
      {/* Line Node 1 -> Node 3 */}
      <path
        d="M 35 46 C 33 52, 42 54, 48 58"
        stroke="#0F172A"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Line Node 2 -> Node 3 */}
      <path
        d="M 68 48 C 66 54, 58 54, 54 58"
        stroke="#1D4ED8"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* ─── Little Doodle Annotations (Sparkle / Star Accent) ─── */}
      <path
        d="M 78 68 L 78 76 M 74 72 L 82 72"
        stroke="#1D4ED8"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BlueprintLogo({ className = "", showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative group cursor-pointer">
        <BlueprintLogoIcon className="h-9 w-9 hover:rotate-6 transition-transform" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-doodle text-xl font-black tracking-wider text-[hsl(var(--foreground))] leading-none">
            BLUEPRINT
          </span>
          <span className="font-mono text-[9px] font-bold tracking-widest text-[hsl(var(--primary))] mt-0.5 uppercase">
            // FORM BUILDER
          </span>
        </div>
      )}
    </div>
  );
}
