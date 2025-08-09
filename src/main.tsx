import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

import { Toaster, toast } from 'react-hot-toast';

// Register SW only when enabled
if ((import.meta as any).env?.VITE_ENABLE_PWA === 'true') {
  // dynamic import to avoid resolving when plugin is disabled
  const mod = 'virtual' + ':pwa-register';
  import(/* @vite-ignore */ mod as any).then(({ registerSW }) => {
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
  }).catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
    <Toaster position="top-right" />
  </React.StrictMode>
);
