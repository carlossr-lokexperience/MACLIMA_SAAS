"use client";

import React, { useState } from "react";
import { RiContrast2Line, RiGoogleFill, RiEyeFill, RiEyeOffFill, RiLoader2Fill } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setSession } from "@/lib/storage";

// ---------------------------------------------------------------------------
// Inline minimal Button para no depender de que el template esté instalado
// ---------------------------------------------------------------------------
function Button({
  children,
  className = "",
  variant = "primary",
  isLoading = false,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  isLoading?: boolean;
}) {
  const base =
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border px-3 py-2 text-center text-sm font-medium shadow-sm transition-all duration-100 ease-in-out disabled:pointer-events-none disabled:shadow-none";
  const variants = {
    primary:
      "border-transparent text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300",
    secondary:
      "border-gray-300 dark:border-gray-800 text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900/60 disabled:text-gray-400",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="pointer-events-none flex shrink-0 items-center justify-center gap-1.5">
          <RiLoader2Fill className="animate-spin size-4 shrink-0" aria-hidden="true" />
          <span>Entrando...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Componente Input con toggle de visibilidad para passwords
// ---------------------------------------------------------------------------
function Input({
  type,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative w-full">
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        className={`relative block w-full appearance-none rounded-md border px-2.5 py-2 shadow-sm outline-none transition sm:text-sm
          border-gray-300 dark:border-gray-800 text-gray-900 dark:text-gray-50
          placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-950
          focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
          ${isPassword ? "pr-10" : ""} ${className}`}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          aria-label="Mostrar/ocultar contraseña"
          className="absolute bottom-0 right-0 flex h-full items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? (
            <RiEyeOffFill className="size-5 shrink-0" aria-hidden="true" />
          ) : (
            <RiEyeFill className="size-5 shrink-0" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página de Login
// ---------------------------------------------------------------------------
export default function LoginPage() {
  const router = useRouter();
  const [portal, setPortal] = useState<"internal" | "partner" | "client">("internal");
  const [email, setEmail] = useState("admin@maclima.local");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const quickFill = (p: typeof portal) => {
    setPortal(p);
    if (p === "internal") { setEmail("admin@maclima.local"); setPassword("admin123"); }
    if (p === "partner") { setEmail("partner@pt-002.local"); setPassword("partner123"); }
    if (p === "client") { setEmail("client@c-001.local"); setPassword("client123"); }
  };

  const handleLogin = async () => {
    setErr(null);
    setLoading(true);
    try {
      const data: any = await api.login(email, password, portal);
      setSession(data);
      const p = data.user.portal;
      if (p === "internal") router.push("/internal/dashboard");
      else if (p === "partner") router.push("/partner/dashboard");
      else router.push("/client/dashboard");
    } catch (e: any) {
      setErr(e.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // SSO Google: redirige al endpoint OAuth del backend
  const handleGoogleSSO = () => {
    // El backend expone /auth/google que inicia el flujo OAuth con Google.
    // Ajusta la URL base si usas una variable de entorno.
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/auth/google`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-28 lg:px-6 bg-white dark:bg-gray-950">
      <div className="relative sm:mx-auto sm:w-full sm:max-w-sm">

        {/* Fondo decorativo (grid de cuadrados, igual que el template Overview) */}
        <div
          className="pointer-events-none absolute -top-[25%] left-1/2 -translate-x-1/2 select-none opacity-60 dark:opacity-90"
          aria-hidden="true"
          style={{
            maskImage: "radial-gradient(rgba(0,0,0,1) 0%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(rgba(0,0,0,1) 0%, transparent 80%)",
          }}
        >
          <div className="flex flex-col gap-1">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={`row-${i}`} className="flex gap-2">
                {Array.from({ length: 10 }, (_, j) => (
                  <div
                    key={`cell-${i}-${j}`}
                    className="size-7 rounded-md shadow shadow-blue-500/40 ring-1 ring-black/5 dark:shadow-blue-400/20 dark:ring-white/10"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Logo */}
        <div className="relative mx-auto w-fit rounded-xl bg-gray-50 dark:bg-gray-900 p-4 shadow-md shadow-black/10 ring-1 ring-black/10 dark:ring-gray-800">
          <div className="absolute left-[9%] top-[9%] size-1 rounded-full bg-gray-100 shadow-inner dark:bg-gray-800" />
          <div className="absolute right-[9%] top-[9%] size-1 rounded-full bg-gray-100 shadow-inner dark:bg-gray-800" />
          <div className="absolute bottom-[9%] left-[9%] size-1 rounded-full bg-gray-100 shadow-inner dark:bg-gray-800" />
          <div className="absolute bottom-[9%] right-[9%] size-1 rounded-full bg-gray-100 shadow-inner dark:bg-gray-800" />
          <div className="w-fit rounded-lg bg-gradient-to-b from-blue-400 to-blue-600 p-3 shadow-sm shadow-blue-500/50 ring-1 ring-inset ring-white/25">
            <RiContrast2Line className="size-8 text-white" aria-hidden="true" />
          </div>
        </div>

        <h2 className="mt-4 text-center text-xl font-semibold text-gray-900 dark:text-gray-50">
          Iniciar sesión en MACLIMA
        </h2>

        {/* Selector de portal (demo) */}
        <div className="mt-6">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3">
            Portal de acceso (demo)
          </p>
          <div className="flex gap-2">
            {(["internal", "partner", "client"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => quickFill(p)}
                className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-all
                  ${portal === p
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
              >
                {p === "internal" ? "Interno" : p === "partner" ? "Partner" : "Cliente"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {/* Botón Google SSO */}
          <Button className="w-full" onClick={handleGoogleSSO}>
            <RiGoogleFill className="size-5" aria-hidden="true" />
            Continuar con Google
          </Button>

          {/* Separador */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs text-gray-400 dark:text-gray-500">o</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          </div>

          {/* Botón que muestra el formulario de email */}
          {!showEmailForm ? (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowEmailForm(true)}
            >
              Continuar con email
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-1.5">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-1.5">
                  Contraseña
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>

              {err && (
                <p className="text-sm text-red-500 dark:text-red-400">{err}</p>
              )}

              <Button
                className="w-full"
                isLoading={loading}
                onClick={handleLogin}
              >
                Entrar
              </Button>
            </div>
          )}
        </div>

        {/* Términos */}
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
          Al iniciar sesión aceptas nuestros{" "}
          <a href="#" className="underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-300">
            términos de servicio
          </a>{" "}
          y{" "}
          <a href="#" className="underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-300">
            política de privacidad
          </a>
          .
        </p>
      </div>
    </div>
  );
}
