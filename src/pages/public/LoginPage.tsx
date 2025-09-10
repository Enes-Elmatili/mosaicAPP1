"use client"

import React, { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"

// -------------------------
// Utils
// -------------------------
function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ")
}

type FieldError = string | null

// -------------------------
// Reusable Field
// -------------------------
const Field: React.FC<{
  label: string
  htmlFor: string
  error?: FieldError
  children: React.ReactNode
}> = ({ label, htmlFor, error, children }) => (
  <label htmlFor={htmlFor} className="block text-left">
    <span className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
      {label}
    </span>
    <div className="mt-1 relative">{children}</div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </label>
)

const InputBase = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { hasError?: boolean }
>(({ hasError, className, ...props }, ref) => (
  <input
    ref={ref}
    className={cx(
      "block w-full rounded-lg border px-3 py-2 text-sm shadow-sm placeholder-neutral-400 transition",
      "focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white",
      hasError
        ? "border-red-500 focus:border-red-500"
        : "border-neutral-300 dark:border-neutral-600 focus:border-black dark:focus:border-white",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100",
      className
    )}
    {...props}
  />
))
InputBase.displayName = "InputBase"

// -------------------------
// Page
// -------------------------
const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, loading, error, isAuthenticated } = useAuth()

  const [email, setEmail] = useState("")
  const [pwd, setPwd] = useState("")
  const [eEmail, setEEmail] = useState<FieldError>(null)
  const [ePwd, setEPwd] = useState<FieldError>(null)
  const [formError, setFormError] = useState<FieldError>(null)

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  function validate(): boolean {
    let ok = true
    setEEmail(null)
    setEPwd(null)
    setFormError(null)
    if (!email.trim() || !isEmail(email)) {
      setEEmail("Email invalide.")
      ok = false
    }
    if (!pwd.trim()) {
      setEPwd("Mot de passe requis.")
      ok = false
    }
    return ok
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    try {
      await login({ email, password: pwd })
      navigate("/app/dashboard", { replace: true })
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Échec de connexion."
      )
    }
  }

  // Redirection hors du rendu pour éviter le warning RouterProvider
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app/dashboard", { replace: true })
    }
  }, [isAuthenticated, navigate])

  return (
    <main className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Header avec logo */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <Link to="/" className="font-extrabold text-xl tracking-tight">
          <span className="bg-gradient-to-r from-secondary via-secondary-purple to-secondary-pink bg-clip-text text-transparent">
            FIXED
          </span>
        </Link>
        <Link
          to="/signup"
          className="rounded-md border border-neutral-300 dark:border-neutral-700 px-4 py-1.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Créer un compte
        </Link>
      </header>

      {/* Formulaire centré */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-lg"
        >
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              Connexion
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Accédez à votre compte FIXED en toute sécurité
            </p>
          </div>

          <form noValidate onSubmit={onSubmit} className="space-y-5">
            {(formError || error) && (
              <div className="rounded-md border border-red-500/40 bg-red-50 dark:bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
                {formError || error}
              </div>
            )}

            <Field label="Email" htmlFor="email" error={eEmail}>
              <InputBase
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                hasError={!!eEmail}
                autoComplete="email"
              />
            </Field>

            <Field label="Mot de passe" htmlFor="password" error={ePwd}>
              <InputBase
                id="password"
                type="password"
                placeholder="••••••••"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                hasError={!!ePwd}
                autoComplete="current-password"
              />
            </Field>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                Se souvenir
              </label>
              <Link
                to="/forgot-password"
                className="text-neutral-600 dark:text-neutral-400 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cx(
                "w-full rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition",
                "hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white active:scale-[.99]",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          {/* CTA bas */}
          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Pas encore de compte ?
            </p>
            <div className="mt-3 flex gap-3">
              <Link
                to="/signup?role=client"
                className="w-1/2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 shadow-sm text-center hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                Client
              </Link>
              <Link
                to="/signup?role=provider"
                className="w-1/2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 shadow-sm text-center hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                Provider
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

export default LoginPage
