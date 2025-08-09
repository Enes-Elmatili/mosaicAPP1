import { create } from 'zustand';
const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

const mk = () => (typeof window==='undefined' ? '' :
  localStorage.getItem('mosaic_master_key') || localStorage.getItem('VITE_MASTER_KEY') || '');

async function apiFetch<T=any>(path:string, init:RequestInit={}) {
  const headers = new Headers(init.headers||{});
  const key = mk(); if (key) headers.set('x-master-key', key);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials:'include' });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text().catch(()=> '')}`);
  // @ts-ignore
  return res.json() as Promise<T>;
}

export type User = { id:string; role?:string; email?:string } | null;

export const useAuth = create<{
  user:User; loading:boolean;
  init:()=>Promise<void>;
  login:(email:string,pwd:string)=>Promise<void>;
  logout:()=>Promise<void>;
}>(set=>({
  user:null, loading:true,
  init: async ()=> {
    try { const { user } = await apiFetch<{user:User}>('/auth/me'); set({ user, loading:false }); }
    catch { set({ user:null, loading:false }); }
  },
  login: async (email,pwd)=>{
    await apiFetch('/auth/login',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,pwd}) });
    const { user } = await apiFetch<{user:User}>('/auth/me'); set({ user, loading:false });
  },
  logout: async ()=>{
    await apiFetch('/auth/logout',{ method:'POST' });
    localStorage.removeItem('mosaic_master_key'); localStorage.removeItem('VITE_MASTER_KEY');
    set({ user:null });
  }
}));
