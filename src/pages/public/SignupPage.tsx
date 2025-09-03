import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context";

/**
 * SignupPage.tsx — Premium minimal (React + TS + Tailwind)
 * - Flux fluide avec redirection automatique par rôle
 * - Rôles corrects: CLIENT | PROVIDER
 */

type FieldError = string | null;
type Role = "client" | "provider" | "";

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <a
    href="/"
    className={`select-none font-extrabold tracking-tight ${className || ""}`}
  >
    <span className="sr-only">Retour à l’accueil MOSAÏC</span>
    <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent">
      MOSAÏC
    </span>
  </a>
);

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

const PasswordStrengthBar: React.FC<{ password: string }> = ({ password }) => {
  const score = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[a-z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 5);
  }, [password]);

  const label =
    ["Très faible", "Faible", "Moyen", "Solide", "Très solide"][
      Math.max(0, score - 1)
    ] || "—";

  return (
    <div aria-live="polite" className="mt-2">
      <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={classNames(
            "h-full transition-all",
            score <= 1 && "bg-red-500",
            score === 2 && "bg-orange-500",
            score === 3 && "bg-yellow-500",
            score === 4 && "bg-green-500",
            score >= 5 && "bg-emerald-600"
          )}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-600">
        Robustesse du mot de passe :{" "}
        <span className="font-medium">{label}</span>
      </p>
    </div>
  );
};

const Field: React.FC<{
  label: string;
  htmlFor: string;
  error?: FieldError;
  children: React.ReactNode;
  helper?: string;
}> = ({ label, htmlFor, error, children, helper }) => (
  <label htmlFor={htmlFor} className="block">
    <span className="block text-sm font-medium text-gray-900">{label}</span>
    <div className={classNames("mt-1 relative")}>{children}</div>
    {helper && !error && (
      <p className="mt-1 text-xs text-gray-500">{helper}</p>
    )}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </label>
);

const InputBase = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { hasError?: boolean }
>(({ hasError, className, ...props }, ref) => (
  <input
    ref={ref}
    className={classNames(
      "block w-full rounded-xl border bg-white/60 backdrop-blur px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400",
      "transition focus:outline-none focus:ring-2 focus:ring-gray-300",
      hasError ? "border-red-500" : "border-gray-300",
      className
    )}
    {...props}
  />
));
InputBase.displayName = "InputBase";

const PasswordInput: React.FC<{
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hasError?: boolean;
  autoComplete?: string;
}> = ({ id, value, onChange, placeholder, hasError, autoComplete }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <InputBase
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        hasError={hasError}
        autoComplete={autoComplete}
        aria-invalid={!!hasError}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute inset-y-0 right-2 my-auto inline-flex items-center justify-center rounded-lg px-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        title={show ? "Masquer" : "Afficher"}
      >
        👁
      </button>
    </div>
  );
};

const RoleCard: React.FC<{
  id: string;
  title: string;
  description: string;
  value: Role;
  checked: boolean;
  onChange: (value: Role) => void;
}> = ({ id, title, description, value, checked, onChange }) => (
  <label
    htmlFor={id}
    className={classNames(
      "relative cursor-pointer rounded-2xl border p-4 transition",
      checked
        ? "border-gray-900 bg-gray-50"
        : "border-gray-200 hover:bg-gray-50"
    )}
  >
    <div className="flex items-start gap-3">
      <input
        type="radio"
        id={id}
        name="role"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="mt-1 h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-400"
      />
      <div>
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        <p className="mt-1 text-xs text-gray-600">{description}</p>
      </div>
    </div>
  </label>
);

const roleToDashboard = (role: Exclude<Role, "">): string => {
  switch (role) {
    case "client":
      return "/app/client/dashboard";
    case "provider":
      return "/app/provider/dashboard";
  }
};

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  // State
  const [role, setRole] = useState<Role>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false);

  // Errors
  const [eRole, setERole] = useState<FieldError>(null);
  const [eFirst, setEFirst] = useState<FieldError>(null);
  const [eLast, setELast] = useState<FieldError>(null);
  const [eEmail, setEEmail] = useState<FieldError>(null);
  const [ePwd, setEPwd] = useState<FieldError>(null);
  const [ePwd2, setEPwd2] = useState<FieldError>(null);
  const [eAccept, setEAccept] = useState<FieldError>(null);

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  function validate(): boolean {
    let ok = true;
    setERole(null);
    setEFirst(null);
    setELast(null);
    setEEmail(null);
    setEPwd(null);
    setEPwd2(null);
    setEAccept(null);

    if (!role) {
      setERole("Choisissez un rôle.");
      ok = false;
    }
    if (!firstName.trim()) {
      setEFirst("Prénom requis.");
      ok = false;
    }
    if (!lastName.trim()) {
      setELast("Nom requis.");
      ok = false;
    }
    if (!email.trim() || !isEmail(email)) {
      setEEmail("Email invalide.");
      ok = false;
    }
    const errs: string[] = [];
    if (pwd.length < 8) errs.push("Min. 8 caractères.");
    if (!/[A-Z]/.test(pwd)) errs.push("Ajoutez une majuscule.");
    if (!/[0-9]/.test(pwd)) errs.push("Ajoutez un chiffre.");
    if (errs.length) {
      setEPwd(errs.join(" "));
      ok = false;
    }
    if (pwd2 !== pwd) {
      setEPwd2("Les mots de passe ne correspondent pas.");
      ok = false;
    }
    if (!accept) {
      setEAccept("Vous devez accepter les conditions.");
      ok = false;
    }
    return ok;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const roleUpper = (role || "").toUpperCase();
      await signup(email, pwd, fullName, roleUpper);
      const target = role
        ? roleToDashboard(role as Exclude<Role, "">)
        : "/app";
      navigate(target, { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Échec de création du compte.";
      setEEmail(message);
    } finally {
      setBusy(false);
    }
  }

  const btnGhost =
    "inline-flex items-center justify-center rounded-xl border border-gray-300 bg-transparent px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300";

  const heroSrc =
    "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1600&auto=format&fit=crop";

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="grid min-h-screen md:grid-cols-2">
        {/* Left */}
        <div className="relative hidden md:block">
          <img
            src={heroSrc}
            alt="Intérieur marocain contemporain"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              const t = e.currentTarget as HTMLImageElement;
              t.onerror = null;
              t.src = "https://picsum.photos/1600/900";
            }}
          />
          <div className="absolute inset-0 bg-black/30" />
          <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-8 py-6">
            <Logo className="text-2xl md:text-3xl" />
            <Link to="/login" className={btnGhost}>
              Se connecter
            </Link>
          </header>
        </div>

        {/* Right / Form */}
        <div className="relative flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold tracking-tight">
              Créer mon compte
            </h2>

            <form
              noValidate
              onSubmit={onSubmit}
              className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              {/* Role */}
              <RoleCard
                id="role-client"
                title="Client"
                description="Suivez vos demandes et factures."
                value="client"
                checked={role === "client"}
                onChange={setRole}
              />
              <RoleCard
                id="role-provider"
                title="Prestataire"
                description="Accédez aux missions et planifications."
                value="provider"
                checked={role === "provider"}
                onChange={setRole}
              />
              {eRole && (
                <p className="mt-2 text-xs text-red-600">{eRole}</p>
              )}

              <hr className="my-5 border-gray-100" />

              {/* Prénom / Nom */}
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Prénom" htmlFor="firstName" error={eFirst}>
                  <InputBase
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    hasError={!!eFirst}
                  />
                </Field>
                <Field label="Nom" htmlFor="lastName" error={eLast}>
                  <InputBase
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    hasError={!!eLast}
                  />
                </Field>
              </div>

              {/* Email */}
              <div className="mt-4">
                <Field label="Email" htmlFor="email" error={eEmail}>
                  <InputBase
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    hasError={!!eEmail}
                  />
                </Field>
              </div>

              {/* Password */}
              <div className="mt-4">
                <Field label="Mot de passe" htmlFor="password" error={ePwd}>
                  <PasswordInput
                    id="password"
                    value={pwd}
                    onChange={setPwd}
                    hasError={!!ePwd}
                  />
                </Field>
                <PasswordStrengthBar password={pwd} />
              </div>

              <div className="mt-4">
                <Field
                  label="Confirmer le mot de passe"
                  htmlFor="password2"
                  error={ePwd2}
                >
                  <PasswordInput
                    id="password2"
                    value={pwd2}
                    onChange={setPwd2}
                    hasError={!!ePwd2}
                  />
                </Field>
              </div>

              {/* Terms */}
              <div className="mt-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
                    checked={accept}
                    onChange={(e) => setAccept(e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">
                    J’accepte les{" "}
                    <a
                      className="text-gray-900 underline"
                      href="/legal/terms"
                    >
                      Conditions
                    </a>{" "}
                    et la{" "}
                    <a
                      className="text-gray-900 underline"
                      href="/legal/privacy"
                    >
                      Politique de confidentialité
                    </a>.
                  </span>
                </label>
                {eAccept && (
                  <p className="mt-1 text-xs text-red-600">{eAccept}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={busy}
                className="mt-6 w-full rounded-xl border border-gray-900 bg-transparent px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white disabled:opacity-70"
              >
                {busy ? "Création…" : "Créer mon compte"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SignupPage;
