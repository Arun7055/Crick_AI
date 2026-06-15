"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, ShieldCheck, HeartPulse } from "lucide-react";

export default function DurabilityPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [durabilityData, setDurabilityData] = useState<any>(null);
  const [durabilityLoading, setDurabilityLoading] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/team/players")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setPlayers(data); })
      .catch((err) => console.error("Failed to fetch players:", err));
  }, []);

  const analyzeWorkload = async (playerId: string) => {
    setSelectedPlayer(playerId);
    if (!playerId) { setDurabilityData(null); return; }
    setDurabilityLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/durability/player/${playerId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Engine Error");
      setDurabilityData(data);
    } catch (error: any) {
      setDurabilityData({ injury_risk_status: "Insufficient Data", durability_score: 0.0, acwr_ratio: 0.0 });
    }
    setDurabilityLoading(false);
  };

  const getStatusColor = (status: string) => {
    if (!status) return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    if (status.includes("High Risk")) return "text-red-500 bg-red-500/10 border-red-500/20";
    if (status.includes("Under-trained")) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-emerald-400" /> Select Player Roster
        </label>
        <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" value={selectedPlayer} onChange={(e) => analyzeWorkload(e.target.value)}>
          <option value="">-- Select a Player --</option>
          {players.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.role})</option>)}
        </select>
      </div>
      
      {durabilityLoading && <div className="animate-pulse bg-slate-900 h-32 rounded-xl border border-slate-800"></div>}
      
      {durabilityData && !durabilityLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-xl border ${getStatusColor(durabilityData.injury_risk_status)}`}>
            <div className="flex items-center gap-3 mb-4">
              {durabilityData.injury_risk_status.includes("High") ? <AlertTriangle className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
              <h2 className="text-xl font-bold">Status</h2>
            </div>
            <p className="text-xl font-semibold">{durabilityData.injury_risk_status}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-slate-400 text-sm">Health Score</span>
              <span className="text-2xl font-bold text-white">{durabilityData.durability_score}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5">
              <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${durabilityData.durability_score}%` }}></div>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 text-sm">Acute-to-Chronic Workload Ratio (ACWR)</span>
              <p className="text-3xl font-mono text-white mt-1">{durabilityData.acwr_ratio}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}