"use client";

import React, { useState, useEffect } from "react";
import { X, Activity, BookOpen, Shield, Zap, HeartPulse } from "lucide-react";

interface DeepProfileData {
  id: string;
  name: string;
  role: string;
  batting_style: string;
  bowling_style: string;
  cricbuzz_profile: string;
  injury_profile: string;
}

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string | null;
}

export default function PlayerCardModal({ isOpen, onClose, playerName }: PlayerModalProps) {
  const [profile, setProfile] = useState<DeepProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !playerName) return;

    setLoading(true);
    setError(null);

    // Call our new case-insensitive FastAPI endpoint
    fetch(`http://127.0.0.1:8000/api/v1/players/details/${encodeURIComponent(playerName)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Player dossier unavailable.");
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

  }, [isOpen, playerName]);

  if (!isOpen) return null;

  // Smart UI color tinting: If the injury report says "No major...", tint it soft green. Otherwise, soft rose.
  const isHealthy = profile?.injury_profile.toLowerCase().includes("no major") ?? true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col text-slate-100">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-5 bg-slate-800/60 border-b border-slate-700/80">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">{playerName}</h2>
            {profile && (
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {profile.role}
                </span>
                <span className="text-xs text-slate-400">• {profile.batting_style}</span>
                {profile.bowling_style !== "Does not bowl" && (
                  <span className="text-xs text-slate-400">• {profile.bowling_style}</span>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Activity className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-xs animate-pulse">Pulling secure ledger records for {playerName}...</p>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 bg-red-950/50 border border-red-800 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          {profile && !loading && (
            <>
              {/* SECTION 1: MEDICAL & DURABILITY LEDGER */}
              <div className={`p-5 rounded-xl border transition-colors ${
                isHealthy 
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200" 
                  : "bg-rose-950/20 border-rose-500/30 text-rose-200"
              }`}>
                <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider">
                  <HeartPulse className={`w-4 h-4 ${isHealthy ? "text-emerald-400" : "text-rose-400"}`} />
                  <span>Medical & Durability Ledger</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-300">{profile.injury_profile}</p>
              </div>

              {/* SECTION 2: TACTICAL BIOGRAPHY */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                  <BookOpen className="w-4 h-4" />
                  <span>Coach's Deep Tactical Biography</span>
                </div>
                <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">
                    {profile.cricbuzz_profile}
                  </p>
                </div>
              </div>
            </>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
}