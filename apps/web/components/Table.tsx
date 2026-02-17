import React from "react";

export function Table({ columns, rows }: { columns: { key: string; label: string }[]; rows: any[] }) {
  return (
    <div className="overflow-auto rounded-2xl border border-white/10 bg-white/5">
      <table className="min-w-full text-sm">
        <thead className="bg-white/5">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left px-3 py-2 text-muted font-medium whitespace-nowrap">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-t border-white/5 hover:bg-white/5 transition">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2 whitespace-nowrap">
                  {String(r[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-muted" colSpan={columns.length}>
                Sin datos
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
