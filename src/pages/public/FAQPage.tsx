"use client"

import * as React from "react"
import { Accordion } from "@/components/ui"
import { useId } from "react"
import { motion } from "framer-motion"
import {
  CreditCard,
  ShieldCheck,
  HelpCircle,
  UserPlus,
  Lock,
  Ban,
  Star,
  MapPin,
  AlertTriangle,
  Headphones,
} from "lucide-react"

function IconWrapper({
  icon: Icon,
  color,
  isOpen,
}: {
  icon: React.ElementType
  color: string
  isOpen: boolean
}) {
  return (
    <motion.div
      initial={{ scale: 1, opacity: 0.8 }}
      animate={{
        scale: isOpen ? 1.2 : 1,
        opacity: 1,
        color: isOpen ? color : "currentColor",
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex-shrink-0"
    >
      <Icon className="h-5 w-5" />
    </motion.div>
  )
}

export default function FAQPage() {
  const faqId = useId()

  const items = [
    {
      id: `${faqId}-payment`,
      title: "Comment fonctionne le paiement ?",
      icon: CreditCard,
      color: "#2563eb", // blue-600
      content: (
        <p className="leading-relaxed text-lg">
          Vous payez directement dans l’application lors de la création de votre
          demande. Les fonds sont sécurisés et ne sont libérés au prestataire
          qu’une fois la mission terminée et validée par vos soins.
        </p>
      ),
    },
    {
      id: `${faqId}-unsatisfied`,
      title: "Que se passe-t-il si je ne suis pas satisfait ?",
      icon: AlertTriangle,
      color: "#f59e0b", // amber-500
      content: (
        <p className="leading-relaxed text-lg">
          Vous pouvez signaler tout problème via l’application. Notre équipe
          support intervient pour résoudre le litige et vous rembourse si
          nécessaire. La satisfaction client est garantie à 100 %.
        </p>
      ),
    },
    {
      id: `${faqId}-provider`,
      title: "Comment devenir prestataire ?",
      icon: UserPlus,
      color: "#16a34a", // green-600
      content: (
        <p className="leading-relaxed text-lg">
          Créez un compte prestataire, complétez vos compétences et
          disponibilités. Après vérification, vous pourrez recevoir des missions
          et commencer à générer des revenus.
        </p>
      ),
    },
    {
      id: `${faqId}-fees`,
      title: "Y a-t-il des frais cachés ?",
      icon: ShieldCheck,
      color: "#0ea5e9", // cyan-600
      content: (
        <p className="leading-relaxed text-lg">
          Non. Le prix affiché est le prix final. Pour les prestataires, une
          commission transparente est appliquée sur chaque mission, sans surprise.
        </p>
      ),
    },
    {
      id: `${faqId}-security`,
      title: "Mes paiements sont-ils sécurisés ?",
      icon: Lock,
      color: "#dc2626", // red-600
      content: (
        <p className="leading-relaxed text-lg">
          Oui. Nous utilisons une technologie de paiement conforme aux standards
          internationaux (PCI-DSS). Toutes les transactions sont chiffrées et
          protégées.
        </p>
      ),
    },
    {
      id: `${faqId}-support`,
      title: "Puis-je contacter un support en cas de problème ?",
      icon: Headphones,
      color: "#9333ea", // purple-600
      content: (
        <p className="leading-relaxed text-lg">
          Notre équipe est disponible 7j/7 directement via l’application. Vous
          pouvez aussi activer le chat instantané ou consulter le centre
          d’assistance pour obtenir de l’aide immédiate.
        </p>
      ),
    },
    {
      id: `${faqId}-insurance`,
      title: "Les prestations sont-elles assurées ?",
      icon: ShieldCheck,
      color: "#14b8a6", // teal-600
      content: (
        <p className="leading-relaxed text-lg">
          Oui, FIXED inclut une couverture responsabilité civile pour toutes les
          missions. Cela vous protège en cas de dommages ou incidents pendant
          l’intervention.
        </p>
      ),
    },
    {
      id: `${faqId}-cancel`,
      title: "Puis-je annuler une demande ?",
      icon: Ban,
      color: "#ea580c", // orange-600
      content: (
        <p className="leading-relaxed text-lg">
          Vous pouvez annuler une mission avant qu’un prestataire ne l’accepte,
          sans frais. Après acceptation, des frais d’annulation raisonnables
          peuvent s’appliquer.
        </p>
      ),
    },
    {
      id: `${faqId}-rating`,
      title: "Comment fonctionne le système de notation ?",
      icon: Star,
      color: "#eab308", // yellow-500
      content: (
        <p className="leading-relaxed text-lg">
          Chaque mission terminée peut être notée par le client et le prestataire.
          Ce système de transparence garantit une communauté fiable et de qualité.
        </p>
      ),
    },
    {
      id: `${faqId}-availability`,
      title: "Dans quelles villes FIXED est-il disponible ?",
      icon: MapPin,
      color: "#be123c", // rose-700
      content: (
        <p className="leading-relaxed text-lg">
          FIXED est actuellement disponible dans les principales grandes villes.
          Notre couverture s’étend régulièrement : vérifiez l’application pour
          découvrir les zones actives en temps réel.
        </p>
      ),
    },
  ]

  return (
    <main
      className="w-full bg-neutral-50 dark:bg-neutral-950"
      aria-labelledby={`${faqId}-title`}
    >
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-24">
        <header className="text-center mb-16">
          <h1
            id={`${faqId}-title`}
            className="text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50"
          >
            Questions fréquentes
          </h1>
          <p className="mt-6 text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Tout ce que vous devez savoir sur FIXED pour utiliser la plateforme
            en toute sérénité.
          </p>
        </header>

        <Accordion
          items={items.map((item) => ({
            id: item.id,
            title: (
              <div className="flex items-center gap-3">
                <IconWrapper
                  icon={item.icon}
                  color={item.color}
                  isOpen={false /* sera override par Accordion */}
                />
                <span>{item.title}</span>
              </div>
            ),
            content: item.content,
          }))}
          singleOpen={true}
          defaultOpenIds={[`${faqId}-payment`]}
          className="bg-white dark:bg-neutral-900 shadow-lg rounded-2xl divide-y divide-neutral-200 dark:divide-neutral-800"
        />
      </section>
    </main>
  )
}