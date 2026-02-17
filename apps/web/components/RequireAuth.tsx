"use client";

import React, { useEffect, useState } from "react";
import { getUser } from "@/lib/storage";
import { useRouter } from "next/navigation";

export function RequireAuth({ children, portal }: { children: React.ReactNode; portal?: "internal" | "partner" | "client" }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/login");
      return;
    }
    if (portal && u.portal !== portal) {
      // Redirect to correct portal home
      if (u.portal === "internal") router.push("/internal/dashboard");
      else if (u.portal === "partner") router.push("/partner/dashboard");
      else router.push("/client/dashboard");
      return;
    }
    setOk(true);
  }, [portal, router]);

  if (!ok) return null;
  return <>{children}</>;
}
