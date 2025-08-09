import React from 'react';
import Hero from '../../components/Landing/Hero';
import Preuves from '../../components/Landing/Preuves';
import Features from '../../components/Landing/Features';
import Pricing from '../../components/Landing/Pricing';
import FAQ from '../../components/Landing/FAQ';

const HomePage: React.FC = () => (
  <>
    <Hero />
    <Preuves />
    <Features />
    <Pricing />
    <FAQ />
  </>
);

export default HomePage;
