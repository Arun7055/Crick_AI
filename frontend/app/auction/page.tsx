"use client";

import { useState } from "react";
import { Gavel, IndianRupee, Users, Target, Activity, Shield, Zap } from "lucide-react";
import PlayerCardModal from "@/components/PlayerCardModal";

interface AuctionRecommendation {
  player_name: string;
  role: string;
  impact_score: number;
  compatibility_score: number;
  max_bid_limit: number;
}

export default function AuctionPage() {
  // Financial & Squad Constraints
  const [purseRemaining, setPurseRemaining] = useState<number>(50.0); // In Crores/Millions
  const [slotsLeft, setSlotsLeft] = useState<number>(5);

  // Team Need Vectors (0.0 to 1.0)
  const [needPowerHitter, setNeedPowerHitter] = useState<number>(0.8);
  const [needAnchorBatter, setNeedAnchorBatter] = useState<number>(0.2);
  const [needWicketTaker, setNeedWicketTaker] = useState<number>(0.7);
  const [needEconomyBowler, setNeedEconomyBowler] = useState<number>(0.5);

  // Response States
  const [recommendations, setRecommendations] = useState<AuctionRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inspectedPlayer, setInspectedPlayer] = useState<string | null>(null);

  const fetchTargets = async () => {
    setLoading(true);
    setError(null);
    try {
      // Point this to the new endpoint we just built!
      const res = await fetch("http://127.0.0.1:8000/api/v1/auction/target-players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purse_remaining: purseRemaining,
          slots_left: slotsLeft,
          need_power_hitter: needPowerHitter,
          need_anchor_batter: needAnchorBatter,
          need_wicket_taker: needWicketTaker,
          need_economy_bowler: needEconomyBowler,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to compute auction targets.");
      }

      const data = await res.json();
      setRecommendations(data.recommendations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500 min-h-screen text-slate-100">
      
      {/* LEFT COLUMN: TEAM NEEDS & CONSTRAINTS */}
      <div className="lg:col-span-1 space-y-6 bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit shadow-xl">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Gavel className="text-yellow-500 w-6 h-6" /> Strategy Room
        </h2>
        <p className="text-xs text-slate-400 mb-6">Adjust your squad gaps and budget to calculate real-time bidding ceilings.</p>

        {/* Financial Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <label className="text-xs text-slate-400 mb-1 flex items-center gap-1"><IndianRupee className="w-3 h-3 text-green-400"/> Purse (Cr)</label>
            <input 
              type="number" 
              value={purseRemaining} 
              onChange={(e) => setPurseRemaining(Number(e.target.value))} 
              className="w-full bg-transparent text-white font-bold text-lg focus:outline-none" 
            />
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <label className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Users className="w-3 h-3 text-blue-400"/> Vacant Slots</label>
            <input 
              type="number" 
              value={slotsLeft} 
              onChange={(e) => setSlotsLeft(Number(e.target.value))} 
              className="w-full bg-transparent text-white font-bold text-lg focus:outline-none" 
            />
          </div>
        </div>

        <div className="h-px bg-slate-800 w-full my-6"></div>

        {/* Vector Sliders */}
        <div className="space-y-5">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400"/> Structural Needs Vector
          </h3>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1"><Zap className="w-3 h-3 text-orange-400"/> Power Hitter</span>
              <span className="text-orange-400 font-bold">{(needPowerHitter * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.1" value={needPowerHitter} onChange={(e) => setNeedPowerHitter(Number(e.target.value))} className="w-full accent-orange-500" />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1"><Shield className="w-3 h-3 text-blue-400"/> Anchor Batter</span>
              <span className="text-blue-400 font-bold">{(needAnchorBatter * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.1" value={needAnchorBatter} onChange={(e) => setNeedAnchorBatter(Number(e.target.value))} className="w-full accent-blue-500" />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1"><Target className="w-3 h-3 text-red-400"/> Wicket Taker</span>
              <span className="text-red-400 font-bold">{(needWicketTaker * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.1" value={needWicketTaker} onChange={(e) => setNeedWicketTaker(Number(e.target.value))} className="w-full accent-red-500" />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1"><Activity className="w-3 h-3 text-green-400"/> Economy Bowler</span>
              <span className="text-green-400 font-bold">{(needEconomyBowler * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.1" value={needEconomyBowler} onChange={(e) => setNeedEconomyBowler(Number(e.target.value))} className="w-full accent-green-500" />
          </div>
        </div>

        <button 
          onClick={fetchTargets} 
          disabled={loading} 
          className="w-full mt-6 bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-extrabold py-3 rounded-lg shadow-[0_0_15px_rgba(202,138,4,0.3)] transition-all disabled:opacity-50 text-sm"
        >
          {loading ? "Calculating Matrices..." : "Compute Target Players"}
        </button>

        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
      </div>

      {/* RIGHT COLUMN: ALGORITHMIC OUTPUT */}
      <div className="lg:col-span-2 space-y-4">
        {recommendations.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 border border-slate-800 border-dashed rounded-xl p-10 bg-slate-900/50">
            <Gavel className="w-12 h-12 mb-3 text-slate-700" />
            <p>Adjust your parameters and compute to see target players.</p>
          </div>
        )}

        {loading && <div className="animate-pulse bg-slate-900 h-[600px] rounded-xl border border-slate-800"></div>}

        {recommendations.length > 0 && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((player, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-yellow-500/50 transition-all shadow-lg relative overflow-hidden" onClick={() => setInspectedPlayer(player.player_name)}>
                
                {/* Ranking Badge */}
                <div className="absolute top-0 right-0 bg-slate-800 text-xs font-bold px-3 py-1 rounded-bl-lg text-slate-400">
                  Target #{idx + 1}
                </div>

                <h3 className="font-bold text-lg text-white mb-1">{player.player_name}</h3>
                
                {/* Bidding Ceiling Block */}
                <div className="mt-4 mb-4 bg-slate-950 rounded-lg p-3 border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Max Bid Limit</span>
                  <span className="text-xl font-black text-green-400 flex items-center">
                    <IndianRupee className="w-5 h-5 mr-0.5" />
                    {player.max_bid_limit.toFixed(2)} Cr
                  </span>
                </div>

                {/* Compatibility Metrics */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Team Compatibility Match</span>
                      <span className="text-yellow-400 font-bold">{player.compatibility_score}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${player.compatibility_score}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Base Impact Rating</span>
                      <span className="text-blue-400 font-bold">{player.impact_score}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${player.impact_score}%` }}></div>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
      {/* Pop-up Dossier Modal */}
      <PlayerCardModal 
        isOpen={!!inspectedPlayer} 
        onClose={() => setInspectedPlayer(null)} 
        playerName={inspectedPlayer} 
      />
    </div>
  );
}