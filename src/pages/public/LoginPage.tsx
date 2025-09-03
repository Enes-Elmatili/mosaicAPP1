import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context";

// Types
type FieldError = string | null;
type AuthUser = { id: string; email: string; roles: string[]; role: string };
type LoginResponse = { ok: boolean; token: string; user: AuthUser };

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <Link to="/" className={`select-none font-extrabold tracking-tight ${className || ""}`}>
    <span className="sr-only">Retour à l’accueil MOSAÏC</span>
    <span className="bg-gradient-to-r from-secondary via-secondary-purple to-secondary-pink bg-clip-text text-transparent">
      MOSAÏC
    </span>
  </Link>
);

const EyeIcon: React.FC<{ on?: boolean }> = ({ on }) => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" role="img">
    {on ? (
      <path
        fill="currentColor"
        d="M3 5.3 4.3 4l16.7 16.7-1.3 1.3-3.2-3.2A11.6 11.6 0 0 1 12 20C6.6 20 2.2 16.3 1 12c.4-1.4 1.3-2.9 2.5-4.2L3 7l1.2-1.2L3 5.2Zm6.2 6.2a3 3 0 0 0 3.3 3.3l-3.3-3.3Zm3-5.8C17.4 5.7 21.8 9.4 23 13.7c-.4 1.5-1.3 3-2.6 4.3l-2-2c.8-.8 1.4-1.7 1.7-2.3-1.1-3-4.5-5.7-8.1-5.7-.7 0-1.4.1-2 .3l-2-2c1-.3 2-.4 3.1-.4Z"
      />
    ) : (
      <path
        fill="currentColor"
        d="M12 5c5.4 0 9.8 3.7 11 7.9-1.2 4.3-5.6 8.1-11 8.1S2.2 17.2 1 12.9C2.2 8.7 6.6 5 12 5Zm0 2c-3.6 0-7 2.7-8.1 5.7C5 16.6 8.4 19 12 19s7-2.4 8.1-6.3C19 9.7 15.6 7 12 7Zm0 2.5A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5Z"
      />
    )}
  </svg>
);

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

const Field: React.FC<{
  label: string;
  htmlFor: string;
  error?: FieldError;
  children: React.ReactNode;
}> = ({ label, htmlFor, error, children }) => (
  <label htmlFor={htmlFor} className="block">
    <span className="block text-sm font-medium text-neutral-100">{label}</span>
    <div className="mt-1 relative">{children}</div>
    {error && <p className="mt-1 text-xs text-pink-400">{error}</p>}
  </label>
);

const InputBase = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { hasError?: boolean }>(
  ({ hasError, className, ...props }, ref) => (
    <input
      ref={ref}
      className={cx(
        "block w-full rounded-xl border bg-neutral-800 px-3 py-2 text-sm text-neutral-100 shadow-sm placeholder-neutral-500 transition",
        "focus:outline-none focus:ring-4 focus:ring-secondary/30",
        hasError ? "border-pink-500 focus:border-pink-500" : "border-neutral-700 focus:border-secondary",
        className
      )}
      {...props}
    />
  )
);
InputBase.displayName = "InputBase";

const PasswordInput: React.FC<{
  id: string;
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}> = ({ id, value, onChange, hasError }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <InputBase
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        hasError={hasError}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute inset-y-0 right-2 my-auto inline-flex items-center justify-center rounded-lg px-2 text-neutral-400 hover:text-neutral-200"
      >
        <EyeIcon on={show} />
      </button>
    </div>
  );
};

// ✅ mapping centralisé des rôles → routes
const DEFAULT_PATHS: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  PROVIDER: "/app/provider/dashboard",
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  const [eEmail, setEEmail] = useState<FieldError>(null);
  const [ePwd, setEPwd] = useState<FieldError>(null);
  const [formError, setFormError] = useState<FieldError>(null);

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  function validate(): boolean {
    let ok = true;
    setEEmail(null);
    setEPwd(null);
    setFormError(null);
    if (!email.trim() || !isEmail(email)) {
      setEEmail("Email invalide.");
      ok = false;
    }
    if (!pwd.trim()) {
      setEPwd("Mot de passe requis.");
      ok = false;
    }
    return ok;
  }

  function chooseDefaultPath(roles?: string[] | null): string {
    const r = (roles || []).map((x) => (x || "").toUpperCase());
    for (const role of r) {
      if (DEFAULT_PATHS[role]) return DEFAULT_PATHS[role];
    }
    return "/app";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const result: LoginResponse = await login(email, pwd);
      const roles = result.user.roles;
      const to = chooseDefaultPath(roles);
      navigate(to, { replace: true });
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Échec de connexion.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-primary text-neutral-100 px-6">
      <div
        className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-strong 
        transition-transform duration-500 ease-out animate-fadeIn"
      >
        <div className="mb-6 text-center">
          <Logo className="text-3xl" />
          <h2 className="mt-4 text-2xl font-bold tracking-tight">Se connecter</h2>
          <p className="mt-1 text-sm text-neutral-400">Accédez à votre espace en toute sécurité</p>
        </div>

        <form noValidate onSubmit={onSubmit} className="space-y-5">
          {formError && (
            <div className="rounded-xl border border-pink-500/40 bg-pink-500/10 px-4 py-3 text-sm text-pink-400">
              {formError}
            </div>
          )}

          <Field label="Email" htmlFor="email" error={eEmail}>
            <InputBase
              id="email"
              name="email"
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              hasError={!!eEmail}
              autoComplete="email"
              inputMode="email"
            />
          </Field>

          <Field label="Mot de passe" htmlFor="password" error={ePwd}>
            <PasswordInput id="password" value={pwd} onChange={setPwd} hasError={!!ePwd} />
          </Field>

          <div className="flex items-center justify-between text-sm text-neutral-400">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-secondary focus:ring-secondary"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Se souvenir de moi
            </label>
            <Link to="/forgot" className="font-medium text-secondary hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={busy}
            className={cx(
              "w-full rounded-xl bg-gradient-to-r from-secondary via-secondary-purple to-secondary-pink px-4 py-2.5",
              "text-sm font-semibold text-white shadow-md transition-all",
              "hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-secondary/30 active:scale-[.99]",
              busy && "opacity-70 cursor-not-allowed"
            )}
          >
            {busy ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Nouveau chez MOSAÏC ?{" "}
          <Link to="/signup" className="font-semibold text-secondary hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
