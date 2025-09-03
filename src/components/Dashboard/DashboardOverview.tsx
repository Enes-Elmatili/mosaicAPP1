import React, { useState } from "react";

/**
 * LoginPage.tsx — Version SAFE (React + TS + Tailwind)
 * - Aucune dépendance externe
 * - Image visible mobile & desktop
 * - Accessible, responsive
 * - + RÔLE + FLOW PAR ÉTAPES + TVA prestataire
 * - Routes : /signup, /forgot, /
 */

type FieldError = string | null;
type Role = "proprietaire" | "locataire" | "prestataire" | null;

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <a href="/" className={`select-none font-extrabold tracking-tight ${className || ""}`}>
    <span className="sr-only">Retour à l’accueil MOSAÏC</span>
    <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
      MOSAÏC
    </span>
  </a>
);

const EyeIcon: React.FC<{ on?: boolean; className?: string; title?: string }> = ({ on, className, title }) => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" className={className} role="img">
    <title>{title || (on ? "Masquer" : "Afficher")}</title>
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
  helper?: string;
}> = ({ label, htmlFor, error, children, helper }) => (
  <label htmlFor={htmlFor} className="block">
    <span className="block text-sm font-medium text-gray-900">{label}</span>
    <div className={cx("mt-1 relative")}>{children}</div>
    {helper && !error && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </label>
);

const InputBase = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { hasError?: boolean }>(
  ({ hasError, className, ...props }, ref) => (
    <input
      ref={ref}
      className={cx(
        "block w-full rounded-xl border bg-white/70 backdrop-blur px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400",
        "transition focus:outline-none focus:ring-4 focus:ring-blue-100",
        hasError ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-600",
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
        aria-describedby={`${id}-desc`}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute inset-y-0 right-2 my-auto inline-flex items-center justify-center rounded-lg px-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      >
        <EyeIcon on={show} />
      </button>
    </div>
  );
};

const Divider: React.FC<{ text?: string }> = ({ text = "ou" }) => (
  <div className="relative my-6">
    <div className="h-px w-full bg-gray-200" />
    <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-3 text-xs text-gray-500">{text}</span>
  </div>
);

const LoginPage: React.FC = () => {
  // --- ÉTATS EXISTANTS ---
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
 
  const [eEmail, setEEmail] = useState<FieldError>(null);
  const [ePwd, setEPwd] = useState<FieldError>(null);
  const [formError, setFormError] = useState<FieldError>(null);

  // --- NOUVELLES FONCTIONNALITÉS ---
  // 1) Sélection du rôle
  const [role, setRole] = useState<Role>(null);
  const [eRole, setERole] = useState<FieldError>(null);

  // 2) Étapes (façon Revolut) : 0=role, 1=email, 2=password, 3=role-specific, 4=recap
  const [step, setStep] = useState<number>(0);

  // 3) Champs spécifiques selon rôle
  const [tva, setTva] = useState<string>(""); // requis si prestataire
  const [eTva, setETva] = useState<FieldError>(null);

  // Optionnels, non bloquants (exemples légers)
  const [hasProperty, setHasProperty] = useState<boolean | null>(null); // propriétaire
  const [leaseRef, setLeaseRef] = useState<string>(""); // locataire

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  // --- VALIDATIONS PAR ÉTAPE ---
  function validateCurrentStep(): boolean {
    // on nettoie les erreurs ciblées
    if (step === 0) setERole(null);
    if (step === 1) setEEmail(null);
    if (step === 2) setEPwd(null);
    if (step === 3) setETva(null);

    if (step === 0) {
      if (!role) {
        setERole("Sélectionnez votre rôle pour continuer.");
        return false;
      }
      return true;
    }

    if (step === 1) {
      if (!email.trim() || !isEmail(email)) {
        setEEmail("Email invalide.");
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!pwd.trim()) {
        setEPwd("Mot de passe requis.");
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (role === "prestataire") {
        // Validation TVA simple et robuste (longueur mini)
        if (!tva.trim() || tva.trim().length < 6) {
          setETva("Numéro de TVA requis (min. 6 caractères).");
          return false;
        }
      }
      // propriétaires / locataires : questions indicatives non bloquantes
      return true;
    }

    return true;
  }

  function nextStep() {
    if (!validateCurrentStep()) return;
    setStep((s) => Math.min(s + 1, 4));
  }

  function prevStep() {
    setFormError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // On ne soumet réel qu'en dernière étape
    if (step < 4) {
      nextStep();
      return;
    }

    setBusy(true);
    setFormError(null);

    // 👉 Branche l'appel API réel ici (fetch/axios). On simule.
    await new Promise((r) => setTimeout(r, 500));
    const fakeOk = true;

    if (!fakeOk) {
      setFormError("Identifiants invalides. Vérifie ton email et ton mot de passe.");
      setBusy(false);
      return;
    }

    setBusy(false);
    window.location.href = "/";
  }

  const heroSrc =
    "https://images.unsplash.com/photo-1536286600215-28fa3b1a3f37?q=80&w=1600&auto=format&fit=crop";

  // --- RENDUS D'ÉTAPES (inline, sans changer la structure/le style global) ---
  function StepHeader() {
    const labels = ["Votre rôle", "Votre email", "Votre mot de passe", "Détails selon rôle", "Récapitulatif"];
    return (
      <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
        <span>Étape {step + 1}/5</span>
        <span>{labels[step]}</span>
      </div>
    );
  }

  function StepContent() {
    // Étape 0 : rôle
    if (step === 0) {
      return (
        <div>
          <Field label="Vous êtes…" htmlFor="role" error={eRole} helper="Choisissez votre profil pour adapter les questions.">
            <div id="role" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {([
                { key: "proprietaire", label: "Propriétaire" },
                { key: "locataire", label: "Locataire" },
                { key: "prestataire", label: "Prestataire" },
              ] as const).map((r) => {
                const selected = role === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRole(r.key)}
                    className={cx(
                      "rounded-xl border px-3 py-2 text-sm font-medium transition",
                      selected
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                    )}
                    aria-pressed={selected}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      );
    }

    // Étape 1 : email
    if (step === 1) {
      return (
        <div>
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
        </div>
      );
    }

    // Étape 2 : mot de passe (+ remember & forgot visibles ici)
    if (step === 2) {
      return (
        <div>
          <Field label="Mot de passe" htmlFor="password" error={ePwd}>
            <PasswordInput
              id="password"
              value={pwd}
              onChange={setPwd}
              placeholder="••••••••"
              hasError={!!ePwd}
              autoComplete="current-password"
            />
          </Field>

          <div className="mt-4 flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Se souvenir de moi
            </label>
            <a href="/forgot" className="text-sm font-medium text-blue-700 underline underline-offset-4">
              Mot de passe oublié ?
            </a>
          </div>
        </div>
      );
    }

    // Étape 3 : spécifique rôle
    if (step === 3) {
      if (role === "prestataire") {
        return (
          <div>
            <Field
              label="Numéro de TVA"
              htmlFor="tva"
              error={eTva}
              helper="Obligatoire pour les prestataires (ex. MA12345678, FR123456789…)">
              <InputBase
                id="tva"
                name="tva"
                placeholder="Ex. MA12345678"
                value={tva}
                onChange={(e) => setTva(e.target.value.toUpperCase())}
                hasError={!!eTva}
                autoComplete="off"
              />
            </Field>
          </div>
        );
      }

      if (role === "proprietaire") {
        return (
          <div>
            <Field label="Possédez-vous déjà un bien ?" htmlFor="hasProperty">
              <div id="hasProperty" className="flex gap-2">
                {[
                  { v: true, label: "Oui" },
                  { v: false, label: "Non" },
                ].map((o) => {
                  const selected = hasProperty === o.v;
                  return (
                    <button
                      key={String(o.v)}
                      type="button"
                      onClick={() => setHasProperty(o.v)}
                      className={cx(
                        "rounded-xl border px-3 py-2 text-sm font-medium transition",
                        selected
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        );
      }

      // locataire
      return (
        <div>
          <Field
            label="Numéro de contrat (optionnel)"
            htmlFor="leaseRef"
            helper="Si vous le connaissez, cela accélère la vérification.">
            <InputBase
              id="leaseRef"
              name="leaseRef"
              placeholder="Ex. L-2025-00123"
              value={leaseRef}
              onChange={(e) => setLeaseRef(e.target.value)}
              autoComplete="off"
            />
          </Field>
        </div>
      );
    }

    // Étape 4 : récap compact (toujours même style global)
    if (step === 4) {
      return (
        <div className="text-sm text-gray-700">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p><span className="font-medium">Rôle :</span> {role === "proprietaire" ? "Propriétaire" : role === "locataire" ? "Locataire" : "Prestataire"}</p>
            <p className="mt-1"><span className="font-medium">Email :</span> {email}</p>
            {role === "prestataire" && (
              <p className="mt-1"><span className="font-medium">TVA :</span> {tva || "—"}</p>
            )}
            {role === "proprietaire" && (
              <p className="mt-1"><span className="font-medium">Bien déjà possédé :</span> {hasProperty === null ? "—" : hasProperty ? "Oui" : "Non"}</p>
            )}
            {role === "locataire" && (
              <p className="mt-1"><span className="font-medium">N° de contrat :</span> {leaseRef || "—"}</p>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Vérifiez vos informations puis validez pour continuer.
          </p>
        </div>
      );
    }

    return null;
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Bandeau image mobile (visible < md) */}
      <div className="relative md:hidden h-48">
        <img
          src={heroSrc}
          alt="Façade moderne au Maroc"
          onError={(e) => {
            const t = e.currentTarget as HTMLImageElement;
            t.onerror = null;
            t.src = "https://picsum.photos/1600/900";
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3">
          <Logo className="text-xl" />
          <a href="/signup" className="rounded-full border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            Créer un compte
          </a>
        </div>
      </div>

      <section className="grid min-h-[calc(100vh-12rem)] md:min-h-screen md:grid-cols-2">
        {/* Colonne image desktop */}
        <div className="relative hidden md:block">
          <img
            src={heroSrc}
            alt="Façade moderne au Maroc"
            onError={(e) => {
              const t = e.currentTarget as HTMLImageElement;
              t.onerror = null;
              t.src = "https://picsum.photos/1600/900";
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
          <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-8 py-6">
            <Logo className="text-2xl md:text-3xl" />
            <a
              href="/signup"
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition"
            >
              Créer un compte
            </a>
          </header>
          <div className="relative z-10 flex h-full items-end p-8">
            <div className="max-w-lg text-white">
              <span className="inline-block rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs tracking-wide backdrop-blur">
                Accès sécurisé & rapide
              </span>
              <h1 className="mt-4 text-3xl font-bold leading-tight">
                Connectez-vous et pilotez vos biens en un clin d’œil.
              </h1>
              <p className="mt-2 text-white/80">
                Suivi des loyers, interventions, documents — tout est centralisé.
              </p>
            </div>
          </div>
        </div>

        {/* Colonne formulaire */}
        <div className="relative flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            {/* Titre inchangé, mais on affiche un indicateur d'étapes discret */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-2xl font-bold tracking-tight">
                {step === 0 ? "Se connecter" : "Se connecter"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Entrez vos informations. C’est rapide.
              </p>
            </div>

            <form noValidate onSubmit={onSubmit} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              {formError && (
                <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {/* Indicateur d'étapes (discret, pas de changement de style global) */}
              <StepHeader />

              {/* CONTENU VARIABLE PAR ÉTAPE */}
              <StepContent />

              {/* Boutons bas étendus (sans changer le style des boutons principaux) */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={step === 0 || busy}
                  className={cx(
                    "rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50",
                    step === 0 && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Précédent
                </button>

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={busy}
                    className={cx(
                      "rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition",
                      "hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 active:scale-[.99]"
                    )}
                  >
                    Continuer
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={busy}
                    className={cx(
                      "rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition",
                      "hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 active:scale-[.99]",
                      busy && "opacity-70 cursor-not-allowed"
                    )}
                    aria-busy={busy}
                  >
                    Valider et continuer
                  </button>
                )}
              </div>

              {/* SSO conservé, mais affiché seulement si étape finale (pour rester simple) */}
              {step === 4 && (
                <>
                  <Divider text="ou continuer avec" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 disabled:opacity-60"
                      aria-label="Continuer avec Google (désactivé)"
                    >
                      Continuer avec Google
                    </button>
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 disabled:opacity-60"
                      aria-label="Continuer avec Apple (désactivé)"
                    >
                      Continuer avec Apple
                    </button>
                  </div>
                </>
              )}
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Nouveau chez MOSAÏC ?{" "}
              <a href="/signup" className="font-semibold text-blue-700 underline underline-offset-4">
                Créer un compte
              </a>
            </p>

            <p className="mt-2 text-center text-xs text-gray-500">
              Accès chiffré. Vous pouvez vous déconnecter sur tous les appareils depuis votre profil.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;