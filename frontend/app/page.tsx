"use client";

import { useState, useEffect } from "react";
import { Activity, AlertTriangle, HeartPulse, ShieldCheck } from "lucide-react";

export default function DurabilityDashboard() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [durabilityData, setDurabilityData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch the player list on load
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/team/players")
      .then((res) => res.json())
      .then((data) => setPlayers(data))
      .catch((err) => console.error("Failed to fetch players:", err));
  }, []);

  // Fetch the XGBoost durability stats when a player is selected
  const analyzeWorkload = async (playerId: string) => {
    setSelectedPlayer(playerId);
    if (!playerId) {
      setDurabilityData(null);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/durability/player/${playerId}`);
      const data = await res.json(); // Read the JSON payload first
      
      if (!res.ok) {
        // Unpack the exact error message sent from FastAPI's HTTPException
        throw new Error(data.detail || "Server error occurred");
      }
      
      setDurabilityData(data);
    } catch (error: any) {
      // This will now print out the EXACT Python exception details to your browser console
      console.error("Detailed Engine Error:", error.message);
      
      setDurabilityData({
        injury_risk_status: "Engine Error",
        durability_score: 0.0,
        acwr_ratio: 0.0
      });
    }
    setLoading(false);
  };

  // Determine UI colors based on ML status
  const getStatusColor = (status: string) => {
    if (!status) return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    if (status.includes("High Risk")) return "text-red-500 bg-red-500/10 border-red-500/20";
    if (status.includes("Under-trained")) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="text-blue-500" />
            Medical & Workload Command Center
          </h1>
          <p className="text-slate-400 mt-2">Powered by XGBoost ACWR Forecasting</p>
        </header>

        {/* Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">Select Player for Analysis</label>
          <select 
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={selectedPlayer}
            onChange={(e) => analyzeWorkload(e.target.value)}
          >
            <option value="">-- Select a Player --</option>
            {players.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="animate-pulse flex space-x-4 bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-800 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-800 rounded"></div>
                <div className="h-4 bg-slate-800 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        )}

        {/* Results Panel */}
        {durabilityData && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Status Card */}
            <div className={`p-6 rounded-xl border ${getStatusColor(durabilityData.injury_risk_status)}`}>
              <div className="flex items-center gap-3 mb-4">
                {durabilityData.injury_risk_status.includes("High Risk") ? <AlertTriangle className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                <h2 className="text-xl font-bold">System Status</h2>
              </div>
              <p className="text-2xl font-semibold">{durabilityData.injury_risk_status}</p>
            </div>

            {/* Metrics Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-slate-400 text-sm flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-blue-400" />
                    Overall Health Score
                  </span>
                  <span className="text-2xl font-bold text-white">{durabilityData.durability_score}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${durabilityData.durability_score}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <span className="text-slate-400 text-sm">Acute-to-Chronic Workload Ratio (ACWR)</span>
                <p className="text-3xl font-mono text-white mt-1">{durabilityData.acwr_ratio}</p>
                <p className="text-xs text-slate-500 mt-1">Target "Sweet Spot": 0.8 - 1.5</p>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}