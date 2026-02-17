import React from "react";

export function Card({ title, subtitle, children, icon }: { title: string; subtitle?: string; children?: React.ReactNode; icon?: string }) {
  return (
    <div className="card animate-fadeUp">
      <div className="cardPad">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold flex items-center gap-2">
              <span className="text-lg">{icon || "✨"}</span>
              {title}
            </div>
            {subtitle ? <div className="muted mt-1">{subtitle}</div> : null}
          </div>
        </div>
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </div>
  );
}
