"use client";

/**
 * /auth/callback
 *
 * El backend redirige aquí tras el login con Google con los parámetros:
 *   ?token=<jwt>&portal=<internal|partner|client>
 *
 * Esta página:
 *  1. Lee el token de la URL.
 *  2. Lo guarda en storage (igual que hace el login clásico).
 *  3. Redirige al dashboard correspondiente.
 */

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setSession } from "@/lib/storage";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const portal = params.get("portal");

    if (!token || !portal) {
      // Si no hay token redirigimos al login con error
      router.replace("/login?error=sso_failed");
      return;
    }

    // Guardamos la sesión con el mismo formato que espera el resto de la app.
    // La API de /auth/me nos dará los datos completos del usuario con el JWT.
    setSession({ access_token: token, user: { portal } });

    // Redirigir al dashboard del portal correspondiente
    if (portal === "internal") router.replace("/internal/dashboard");
    else if (portal === "partner") router.replace("/partner/dashboard");
    else router.replace("/client/dashboard");
  }, [params, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
      <div className="text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Iniciando sesión con Google...
        </p>
      </div>
    </div>
  );
}
