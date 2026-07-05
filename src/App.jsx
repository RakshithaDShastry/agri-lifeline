import React, { useState, useEffect } from 'react';
import { supabase } from './utils/supabaseClient';
import { getLatestBlockHash, calculateBlockHash } from './utils/cryptoChain';
import TreatmentForm from './components/TreatmentForm';
import DashboardTable from './components/DashboardTable';
import { ShieldCheck, LogIn, LogOut, User } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // 1. Manage User Authentication States
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch treatment records in real-time when a session becomes active
  const fetchTreatments = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select(`
          id,
          drug_name,
          dosage,
          withdrawal_days_meat,
          administered_at,
          prev_hash,
          block_hash,
          animal_id,
          animals (
            batch_tag
          )
        `)
        .order('administered_at', { ascending: false });

      if (error) throw error;
      setTreatments(data || []);
    } catch (err) {
      console.error('Error fetching records:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTreatments();
    }
  }, [session]);

  // 3. Simple Mock Authenticator for Hackathon Demos
  const handleMockLogin = async () => {
    // Local bypass to prevent Supabase cloud rate limits during local testing/demos
    const mockSession = {
      user: {
        id: '00000000-0000-0000-0000-000000000000', // Baseline uuid format
        email: 'farmer@agrilifeline.com'
      }
    };
    setSession(mockSession);
  };

  const handleLogout = () => supabase.auth.signOut();

  // 4. The Core Cryptographic Saving Loop
  const handleSaveTreatment = async (formData) => {
    try {
      // A. Verify if the target animal batch tag exists in our DB, or register it first
      let animalId;
      const { data: animalCheck, error: fetchErr } = await supabase
        .from('animals')
        .select('id')
        .eq('batch_tag', formData.batchTag)
        .limit(1);

      if (fetchErr) throw fetchErr;

      if (animalCheck && animalCheck.length > 0) {
        animalId = animalCheck[0].id;
      } else {
        // Create an entry for the new animal batch under this user account context
        const { data: newAnimal, error: createErr } = await supabase
          .from('animals')
          .insert([{ batch_tag: formData.batchTag, species: formData.species, owner_id: session.user.id }])
          .select();

        if (createErr) throw createErr;
        animalId = newAnimal[0].id;
      }

      // B. Retrieve the previous hash for this animal's timeline to link the chain
      const prevHash = await getLatestBlockHash(animalId);

      // C. Generate the distinct SHA-256 block signature
      const blockHash = calculateBlockHash(animalId, formData.drugName, formData.dosage, prevHash);

      // D. Commit the final transaction payload safely into PostgreSQL
      const { error: insertErr } = await supabase
        .from('treatments')
        .insert([
          {
            animal_id: animalId,
            drug_name: formData.drugName,
            dosage: formData.dosage,
            withdrawal_days_meat: parseInt(formData.withdrawalDays, 10),
            raw_transcript: formData.rawTranscript,
            prev_hash: prevHash,
            block_hash: blockHash
          }
        ]);

      if (insertErr) throw insertErr;

      // E. Reload our real-time board table display view
      await fetchTreatments();
    } catch (err) {
      console.error('Save transaction aborted:', err);
      throw err;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-400 flex items-center justify-center text-sm font-medium animate-pulse">
        Initializing Secure Gateways...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Universal Top Nav Header Layout */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg shadow-md shadow-emerald-900/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Agri-Lifeline</h1>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">MRL & Antimicrobial Compliance Ledger</p>
          </div>
        </div>

        {session ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{session.user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </div>
        ) : (
          <button
            onClick={handleMockLogin}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2 rounded-lg transition shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" /> Initialize Demo Session
          </button>
        )}
      </header>

      {/* Main Workspace Frame */}
      <main className="py-8 px-4 flex flex-col gap-8 items-center max-w-7xl mx-auto">
        {!session ? (
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-xl mt-12">
            <h2 className="text-xl font-bold mb-3">Welcome to Agri-Lifeline</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              A distributed compliance architecture tracking regulatory livestock withdrawal intervals and protecting food chains from drug residues.
            </p>
            <button
              onClick={handleMockLogin}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Start Live Sandbox Profile
            </button>
          </div>
        ) : (
          <>
            {/* Interactive Forms Integration Panel */}
            <TreatmentForm onLogSaved={handleSaveTreatment} />
            
            <hr className="w-full max-w-4xl border-slate-800/60 my-2" />
            
            {/* Live Data Visualizations Monitoring Board */}
            <DashboardTable treatments={treatments} loading={loading} />
          </>
        )}
      </main>
    </div>
  );
}