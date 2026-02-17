import React from "react";
import { Badge } from "@/components/Badge";

export function PageHeader({ title, subtitle, tags }: { title: string; subtitle?: string; tags?: { label: string; tone?: any }[] }) {
  return (
    <div className="mb-5">
      <div className="text-2xl font-semibold">{title}</div>
      {subtitle ? <div className="muted mt-1">{subtitle}</div> : null}
      {tags && tags.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t, idx) => (
            <Badge key={idx} tone={t.tone || "info"}>{t.label}</Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
