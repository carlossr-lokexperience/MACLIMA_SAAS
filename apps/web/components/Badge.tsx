import React from "react";
import clsx from "clsx";

export function Badge({ tone = "info", children }: { tone?: "ok" | "warn" | "bad" | "info"; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        "pill",
        tone === "ok" && "pill-ok",
        tone === "warn" && "pill-warn",
        tone === "bad" && "pill-bad",
        tone === "info" && "pill-info"
      )}
    >
      {children}
    </span>
  );
}
