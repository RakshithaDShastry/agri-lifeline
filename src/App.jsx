import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-6 text-center shadow-xl">
        <ShieldCheck className="mx-auto text-emerald-400 w-12 h-12 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Agri-Lifeline Baseline</h1>
        <p className="text-slate-400 text-sm">
          Vite + React + Tailwind v4 environment successfully initialized!
        </p>
      </div>
    </div>
  );
}