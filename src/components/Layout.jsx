import React from 'react';
import Header from './Header';
import Footer from './Footer';

/**
 * Layout principal réutilisable : header fixe, contenu et footer.
 */
export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
