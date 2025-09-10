import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary-purple to-secondary-pink text-white">
      <div className="container mx-auto px-6 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl sm:text-6xl font-bold tracking-tight"
        >
          Simplifiez la gestion de vos biens <br /> avec MOSAÏC
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-6 text-lg sm:text-xl text-neutral-100/80 max-w-2xl mx-auto"
        >
          Une plateforme premium inspirée par Uber & Revolut, pour gérer vos
          propriétés et vos services en toute simplicité.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex justify-center gap-4"
        >
          <Button variant="primary" size="lg">
            Commencer
          </Button>
          <Button variant="secondary" size="lg">
            En savoir plus
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
