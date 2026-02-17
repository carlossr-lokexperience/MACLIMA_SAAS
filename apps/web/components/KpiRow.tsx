import React from "react";

export function KpiRow({ items }: { items: { label: string; value: string; delta?: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {items.map((it, idx) => (
        <div key={idx} className="card">
          <div className="cardPad">
            <div className="muted">{it.label}</div>
            <div className="text-2xl font-semibold mt-1">{it.value}</div>
            {it.delta ? <div className="text-xs text-muted mt-1">{it.delta}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
