"use client"

import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Home, HelpCircle } from "lucide-react"

const NotFoundPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-6 text-center">
      {/* Animation d’entrée */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-lg"
      >
        {/* Code d’erreur */}
        <h1 className="text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          404
        </h1>

        {/* Message principal */}
        <h2 className="mt-4 text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
          Page introuvable
        </h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Oups… la page que vous cherchez n’existe pas ou a été déplacée.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          >
            <Home className="h-4 w-4" />
            Retour à l’accueil
          </Link>
          <Link
            to="/help"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 shadow-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <HelpCircle className="h-4 w-4" />
            Contacter le support
          </Link>
        </div>
      </motion.div>
    </main>
  )
}

export default NotFoundPage