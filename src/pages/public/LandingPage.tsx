"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { Button, Card } from "@/components/ui"

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            FIXED, la plateforme qui connecte{" "}
            <span className="text-primary">clients et prestataires</span>
          </h1>
          <p className="mt-5 text-lg text-neutral-600">
            Publiez une demande, recevez un professionnel vérifié et payez en toute
            sécurité. Simple, rapide et garanti.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              to="/services"
              className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-black text-white text-sm font-medium shadow-sm hover:bg-neutral-800"
            >
              Trouver un service
            </Link>
            <Link
              to="/register-provider"
              className="inline-flex items-center justify-center h-11 px-5 rounded-xl border border-neutral-300 text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Devenir prestataire
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-6 text-sm text-neutral-600">
            <span>4.9 sur 5</span>
            <span>50 000+ utilisateurs</span>
            <span>moins de 30 min en moyenne</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-neutral-50 h-72 md:h-96 flex items-center justify-center">
          <p className="text-neutral-500">Aperçu de l’interface FIXED</p>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="how" className="bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Comment ça marche ?</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <h3 className="font-semibold">1. Publiez</h3>
              <p className="mt-2 text-sm text-neutral-600">Décrivez votre besoin en quelques clics.</p>
            </Card>
            <Card className="p-6 text-center">
              <h3 className="font-semibold">2. Recevez</h3>
              <p className="mt-2 text-sm text-neutral-600">Un prestataire disponible accepte et intervient.</p>
            </Card>
            <Card className="p-6 text-center">
              <h3 className="font-semibold">3. Payez</h3>
              <p className="mt-2 text-sm text-neutral-600">Payez via FIXED et évaluez votre expérience.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section id="why" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Pourquoi choisir FIXED ?</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold">Paiement sécurisé</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Les fonds sont libérés uniquement après validation du service.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold">Rapidité garantie</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Un professionnel en quelques minutes, intervention rapide.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold">Prestataires vérifiés</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Contrôles d’identité et qualité suivie par la communauté.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section id="cta" className="bg-primary text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Prêt à commencer ?</h2>
          <p className="mt-2 opacity-90">
            Rejoignez des milliers d’utilisateurs qui font confiance à FIXED.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-white text-neutral-900 text-sm font-medium shadow-sm hover:bg-neutral-100"
            >
              Trouver un service
            </Link>
            <Link
              to="/register-provider"
              className="inline-flex items-center justify-center h-11 px-5 rounded-xl border border-white/60 text-white text-sm font-medium hover:bg-white/10"
            >
              Devenir prestataire
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
