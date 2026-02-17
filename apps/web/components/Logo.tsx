import React from "react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand to-brand2 shadow-glow" />
      <div className="leading-tight">
        <div className="font-semibold">MACLIMA OS</div>
        <div className="text-xs text-muted">Operations Platform</div>
      </div>
    </div>
  );
}
