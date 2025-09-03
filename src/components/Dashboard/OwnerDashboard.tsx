// src/components/Dashboard/OwnerDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2, Home, DollarSign, CheckCircle2, AlertTriangle,
  MapPin, Plus, ArrowRight
} from "lucide-react";

type PropertyItem = {
  id: string;
  title: string;
  address?: string;
  city?: string;
  isAvailable?: boolean | null;
  price?: number | null;
  createdAt?: Date;
  lat?: number | null;
  lng?: number | null;
};

type OwnerDashboardProps = {
  properties?: PropertyItem[];
};

function SummaryCard({
  label, value, icon, footer, delay = 0,
}: { label: string; value: string; icon: React.ReactNode; footer?: React.ReactNode; delay?: number }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur
                 transition-all duration-300 hover:shadow-md hover:-translate-y-[2px]
                 opacity-0 translate-y-2 animate-[fadein_0.7s_forwards]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-black/5 to-transparent blur-2xl" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-slate-700">{icon}</div>
      </div>
      {footer ? <div className="mt-3 text-[12px] text-slate-500">{footer}</div> : null}
    </div>
  );
}

function Card({ title, action, children, delay = 0 }:{
  title: string; action?: React.ReactNode; children: React.ReactNode; delay?: number
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur
                 transition-all duration-300 hover:shadow-md
                 opacity-0 translate-y-2 animate-[fadein_0.7s_forwards]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-black/5 via-transparent to-black/5" />
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function OwnerDashboard({ properties = [] }: OwnerDashboardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 10); return () => clearTimeout(t); }, []);

  const items = useMemo<PropertyItem[]>(() => properties, [properties]);

  // KPIs
  const totalProps = items.length;
  const available = items.filter(p => p.isAvailable === true).length;
  const occupied = items.filter(p => p.isAvailable === false).length;
  const priced = items.filter(p => typeof p.price === "number");
  const avgPrice = priced.length
    ? Math.round(priced.reduce((s, p) => s + (p.price || 0), 0) / priced.length).toLocaleString("fr-BE")
    : "—";

  const recent = useMemo(
    () => [...items].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)).slice(0, 5),
    [items]
  );

  // Map embed (lat/lng prioritaire, sinon adresse/ville du 1er bien)
  const mapSrc = useMemo(() => {
    const withGeo = items.find(p => typeof p.lat === "number" && typeof p.lng === "number");
    if (withGeo && withGeo.lat != null && withGeo.lng != null) {
      return `https://www.google.com/maps?hl=fr&q=${withGeo.lat},${withGeo.lng}&z=13&output=embed`;
    }
    const first = items.find(p => p.address || p.city);
    if (!first) return null;
    const q = encodeURIComponent([first.address, first.city].filter(Boolean).join(", "));
    return `https://www.google.com/maps?hl=fr&q=${q}&z=12&output=embed`;
  }, [items]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header (unique) */}
      <div
        className={`rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur transition-all
                    ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-[11px] text-slate-600">
              Espace propriétaire
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Tableau de bord</h1>
            <p className="mt-1 text-sm text-slate-500">Vos biens, vos actions, en un coup d’œil.</p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/properties/new"
              className="group inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition
                         hover:shadow-md hover:-translate-y-[1px]"
            >
              Nouveau bien
              <Plus className="h-4 w-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 transition
                         hover:bg-slate-50"
            >
              <ArrowRight className="h-4 w-4" />
              Voir mes biens
            </Link>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Biens"
          value={String(totalProps)}
          icon={<Building2 className="h-6 w-6" />}
          footer={<span>{available} dispo · {occupied} occupés</span>}
          delay={40}
        />
        <SummaryCard
          label="Disponibles"
          value={`${available}`}
          icon={<CheckCircle2 className="h-6 w-6" />}
          footer={<span>{occupied} non disponibles</span>}
          delay={80}
        />
        <SummaryCard
          label="Loyer moyen"
          value={typeof avgPrice === "string" ? avgPrice : `${avgPrice} €`}
          icon={<DollarSign className="h-6 w-6" />}
          footer={<span>Basé sur les biens avec prix</span>}
          delay={120}
        />
        <SummaryCard
          label="Alertes"
          value={"0"}
          icon={<AlertTriangle className="h-6 w-6" />}
          footer={<span>Aucune alerte critique</span>}
          delay={160}
        />
      </div>

      {/* Actions rapides */}
      <Card title="Actions rapides" delay={200}>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/properties/new"
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50 hover:shadow-sm"
          >
            <div className="mb-2 inline-flex rounded-lg bg-slate-100 p-2">
              <Home className="h-4 w-4 text-slate-700" />
            </div>
            <p className="text-sm font-medium text-slate-900">Ajouter un bien</p>
            <p className="text-xs text-slate-500">Adresse, surface, pièces…</p>
          </Link>
          <Link
            to="/requests"
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50 hover:shadow-sm"
          >
            <div className="mb-2 inline-flex rounded-lg bg-slate-100 p-2">
              <AlertTriangle className="h-4 w-4 text-slate-700" />
            </div>
            <p className="text-sm font-medium text-slate-900">Mes demandes</p>
            <p className="text-xs text-slate-500">Suivre les interventions</p>
          </Link>
        </div>
      </Card>

      {/* Carte des biens */}
      {mapSrc ? (
        <Card
          title="Carte des biens"
          action={
            <a
              href={mapSrc.replace("output=embed", "")}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              Ouvrir dans Maps
            </a>
          }
          delay={230}
        >
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-slate-200">
            <iframe
              src={mapSrc}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Carte des biens"
            />
          </div>
          {items.length > 1 && (
            <p className="mt-2 text-xs text-slate-500">
              Astuce&nbsp;: ouvrez la carte pour voir tous les biens. (Marqueurs multiples — prochaine étape)
            </p>
          )}
        </Card>
      ) : (
        <Card title="Carte des biens" delay={230}>
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            Ajoutez une adresse/ville (ou des coordonnées) à un bien pour afficher la carte.
          </div>
        </Card>
      )}

      {/* Biens récents */}
      <Card
        title="Biens récents"
        action={<Link to="/properties" className="text-xs text-slate-600 hover:text-slate-900">Tout voir</Link>}
        delay={260}
      >
        {recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            Aucun bien pour l’instant. <Link className="underline" to="/properties/new">Ajoute ton premier bien</Link>.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <Building2 className="h-5 w-5 text-slate-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{p.title}</p>
                  <p className="truncate text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{p.city || "—"}</span>
                    <span className="text-slate-300">•</span>
                    <span>{p.address || "—"}</span>
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  {p.createdAt ? p.createdAt.toLocaleDateString("fr-BE") : "—"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* keyframes */}
      <style>{`@keyframes fadein{to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
