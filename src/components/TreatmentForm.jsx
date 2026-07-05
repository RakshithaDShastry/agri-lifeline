import React, { useState } from 'react';
import VoiceLogger from './VoiceLogger';
import { parseTranscriptWithRegex } from '../utils/fallbackParser';
import { FilePlus, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function TreatmentForm({ onLogSaved }) {
  const [batchTag, setBatchTag] = useState('');
  const [drugName, setDrugName] = useState('');
  const [dosage, setDosage] = useState('');
  const [withdrawalDays, setWithdrawalDays] = useState('0');
  const [rawTranscript, setRawTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // This handles what happens when a farmer finishes speaking into the microphone
  const handleVoiceCaptured = (transcript) => {
    setRawTranscript(transcript);
    
    // Run our deterministic parsing utility on the text
    const parsed = parseTranscriptWithRegex(transcript);
    
    if (parsed) {
      if (parsed.batchTag) setBatchTag(parsed.batchTag);
      if (parsed.drugName) setDrugName(parsed.drugName);
      if (parsed.dosage) setDosage(parsed.dosage);
      if (parsed.withdrawalDays) setWithdrawalDays(String(parsed.withdrawalDays));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setSuccessMsg('');

    try {
      // Pass the form details upward to handle the database write loop
      if (onLogSaved) {
        await onLogSaved({
          batchTag,
          species: 'Livestock', // Baseline fallback categorization
          drugName,
          dosage,
          withdrawalDays,
          rawTranscript
        });
      }

      setSuccessMsg('Treatment recorded and cryptographically sealed!');
      // Reset form fields
      setBatchTag('');
      setDrugName('');
      setDosage('');
      setWithdrawalDays('0');
      setRawTranscript('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mx-auto p-4">
      {/* Left Column: Voice Capture Widget */}
      <div className="flex flex-col justify-center">
        <VoiceLogger onTranscriptComplete={handleVoiceCaptured} />
      </div>

      {/* Right Column: Structured Review & Submit Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Verify Compliance Record
        </h3>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Animal Batch Tag</label>
          <input
            type="text"
            required
            value={batchTag}
            onChange={(e) => setBatchTag(e.target.value)}
            placeholder="e.g., Batch 4"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Medication / Drug Name</label>
          <input
            type="text"
            required
            value={drugName}
            onChange={(e) => setDrugName(e.target.value)}
            placeholder="e.g., Amoxicillin"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Dosage Volume</label>
            <input
              type="text"
              required
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 5ml"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">MRL Withdrawal (Days)</label>
            <input
              type="number"
              min="0"
              required
              value={withdrawalDays}
              onChange={(e) => setWithdrawalDays(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isProcessing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <FilePlus className="w-4 h-4" />
              Commit Secure Record
            </>
          )}
        </button>

        {successMsg && (
          <div className="mt-2 p-3 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded-lg flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p>{successMsg}</p>
          </div>
        )}
      </form>
    </div>
  );
}