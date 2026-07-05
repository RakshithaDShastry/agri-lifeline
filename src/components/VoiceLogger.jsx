import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

export default function VoiceLogger({ onTranscriptComplete }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Check for browser compatibility (Chrome, Edge, Safari support this natively)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Web Speech API is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false; // Stops recording automatically when the user finishes speaking a sentence
    rec.interimResults = false; // Only deliver final refined text blocks
    rec.lang = 'en-IN'; // Sets optimization defaults for Indian English accents

    rec.onstart = () => {
      setIsListening(true);
      setError('');
    };

    rec.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setTranscript(resultText);
      if (onTranscriptComplete) {
        onTranscriptComplete(resultText);
      }
    };

    rec.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Voice Error: ${event.error}. Ensure microphone permissions are granted.`);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    setRecognition(rec);
  }, [onTranscriptComplete]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      setError('');
      recognition.start();
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Hands-Free Voice Entry
        </h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isListening ? 'bg-red-500/10 text-red-400 animate-pulse' : 'bg-slate-700 text-slate-300'
        }`}>
          {isListening ? 'Listening Live' : 'Microphone Ready'}
        </span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={toggleListening}
          type="button"
          className={`p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-500/30' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <p className="text-xs text-slate-400 text-center">
          Click the mic button and state details clearly.<br />
          <span className="italic text-slate-500">e.g., "Administered 10ml Penicillin to Batch B."</span>
        </p>

        {transcript && (
          <div className="w-full mt-2 p-3 bg-slate-900 border border-slate-700 rounded-lg">
            <span className="text-xs text-emerald-400 font-bold block mb-1">Captured Text:</span>
            <p className="text-sm text-slate-200 leading-relaxed">{transcript}</p>
          </div>
        )}

        {error && (
          <div className="w-full mt-2 p-3 bg-red-950/40 border border-red-900/50 text-red-400 rounded-lg flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}