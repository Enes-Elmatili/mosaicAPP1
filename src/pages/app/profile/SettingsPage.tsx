"use client"

import * as React from "react"
import { ProfileCard } from "@/components/ui/ProfileCard"
import { Section } from "@/components/ui/Section"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Cell } from "@/components/ui"  
import { Switch } from "@/components/ui/Switch"
import { DangerZone } from "@/components/ui/DangerZone"
import { AvatarUploader } from "@/components/ui/AvatarUploader"

export default function SettingsPage() {
  // States
  const [notifications, setNotifications] = React.useState(true)
  const [darkMode, setDarkMode] = React.useState(false)
  const [avatarModal, setAvatarModal] = React.useState(false)
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(
    "/avatars/john.png"
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
      {/* Profil */}
      <Section title="Profil" description="Gérez vos informations personnelles.">
        <ProfileCard
          name="John Doe"
          email="john.doe@example.com"
          avatarUrl={avatarUrl}
          onEdit={() => setAvatarModal(true)}
        />
      </Section>

      {/* Préférences */}
      <Section title="Préférences" description="Personnalisez votre expérience.">
        <Card>
          <CardHeader>
            <CardTitle>Apparence & Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <Cell
                title="Notifications"
                description="Recevoir des alertes push et email"
                action={<Switch checked={notifications} onChange={setNotifications} />}
              />
              <Cell
                title="Mode sombre"
                description="Utiliser le thème sombre"
                action={<Switch checked={darkMode} onChange={setDarkMode} />}
              />
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Abonnement */}
      <Section title="Abonnement" description="Gérez votre plan et vos paiements.">
        <Card>
          <CardHeader>
            <CardTitle>Mon plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <Cell
                title="Plan actuel"
                description="Premium — 19,99 € / mois"
                action={<span className="text-sm font-medium text-primary">Actif</span>}
              />
              <Cell
                title="Moyen de paiement"
                description="Carte Visa •••• 4242"
                action={<button className="text-primary">Mettre à jour</button>}
              />
              <Cell
                title="Factures"
                description="Consultez et téléchargez vos factures"
                action={<button className="text-primary">Voir</button>}
              />
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Sécurité */}
      <Section title="Sécurité" description="Protégez l’accès à votre compte.">
        <Card>
          <CardHeader>
            <CardTitle>Authentification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <Cell
                title="Changer le mot de passe"
                description="Mettre à jour vos identifiants"
                action={<button className="text-primary">Modifier</button>}
              />
              <Cell
                title="Déconnexion"
                description="Fermer la session sur cet appareil"
                action={<button className="text-red-500">Déconnecter</button>}
              />
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Danger Zone */}
      <Section
        title="Compte"
        description="Actions critiques liées à votre compte."
      >
        <DangerZone
          title="Zone dangereuse"
          description="Ces actions sont irréversibles. Procédez avec prudence."
          actions={[
            {
              label: "Désactiver le compte",
              description: "Suspend temporairement votre compte.",
              onAction: () => alert("Compte désactivé"),
            },
            {
              label: "Révoquer tous les accès",
              description: "Déconnecte tous les appareils connectés.",
              onAction: () => alert("Accès révoqués"),
            },
            {
              label: "Supprimer le compte",
              description: "Supprime définitivement vos données.",
              onAction: () => alert("Compte supprimé"),
            },
          ]}
        />
      </Section>

      {/* Modal Uploader Avatar */}
      <AvatarUploader
        open={avatarModal}
        onClose={() => setAvatarModal(false)}
        onSave={(file) => {
          const url = URL.createObjectURL(file)
          setAvatarUrl(url)
          console.log("Avatar uploadé :", file)
        }}
      />
    </div>
  )
}

SettingsPage.displayName = "SettingsPage"