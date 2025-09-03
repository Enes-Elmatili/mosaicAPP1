import React from "react";
import PageWrapper from "@/components/layout/PageWrapper"; // ton wrapper header/footer
import Hero from "@/components/Landing/Hero";
import Preuves from "@/components/Landing/Preuves";
import Features from "@/components/Landing/Features";
import Pricing from "@/components/Landing/Pricing";
import FAQ from "@/components/Landing/FAQ";

const HomePage: React.FC = () => {
  return (
    <PageWrapper headerVariant="transparent" container={false}>
      {/* HERO */}
      <Hero />

      {/* PREUVES SOCIALES */}
      <Preuves />

      {/* FEATURES */}
      <Features />

      {/* PRICING */}
      <Pricing />

      {/* FAQ */}
      <FAQ />

      {/* CTA finale */}
      <section className="bg-neutral-900 text-neutral-100 py-16 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Rejoignez MOSAÏC aujourd’hui
          </h2>
          <p className="mt-3 text-neutral-400 max-w-xl mx-auto">
            Simplifiez la gestion de vos biens, gagnez du temps et profitez d’un
            service premium inspiré par les meilleurs standards internationaux.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/signup"
              className="btn btn-secondary"
            >
              Créer un compte
            </a>
            <a
              href="/offers"
              className="btn btn-outline"
            >
              Découvrir nos offres
            </a>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default HomePage;
