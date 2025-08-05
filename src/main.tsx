import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

import { registerSW } from 'virtual:pwa-register';
import { Toaster, toast } from 'react-hot-toast';

const updateSW = registerSW({
  onNeedRefresh() {
    toast(
      t => (
        <span>
          Nouvelle version dispo&nbsp;
          <button onClick={() => { updateSW(); toast.dismiss(t.id); }} className="underline">
            Rechargez
          </button>
        </span>
      ),
      { duration: Infinity }
    );
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
    <Toaster position="top-right" />
  </React.StrictMode>
);
