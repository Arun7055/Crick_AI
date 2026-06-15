"use client";

import { useState } from "react";
import { Wallet, Users } from "lucide-react";

export default function AuctionPage() {
  const [purse, setPurse] = useState(4500);
  const [gaps] = useState(["Overseas Fast Bowler", "Indian Finisher"]);
  const [auctionData, setAuctionData] = useState<any>(null);
  const [auctionLoading, setAuctionLoading] = useState(false);
  
  const initialPool = [
    { name: "Mitchell Starc", role: "Bowler", base_price_lakhs: 200, skills: ["Left-arm fast", "Death bowling"] },
    { name: "Rinku Singh", role: "Batter", base_price_lakhs: 50, skills: ["Left-hand bat", "Finisher"] }
  ];

  const calculateAuctionStrategy = async () => {
    setAuctionLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auction/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remaining_purse_lakhs: purse, squad_gaps: gaps, available_pool: initialPool })
      });
      const data = await res.json();
      setAuctionData(data);
    } catch (error) {
      console.error("Auction analysis failed:", error);
    }
    setAuctionLoading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 md:col-span-1 h-fit">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-purple-400" /> Capital Allocation
        </h3>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Purse (Lakhs)</label>
          <input type="number" value={purse} onChange={(e) => setPurse(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-2 mt-4">Identified Roster Gaps</label>
          <div className="flex flex-wrap gap-2">
            {gaps.map((gap, i) => (
              <span key={i} className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded">{gap}</span>
            ))}
          </div>
        </div>
        <button onClick={calculateAuctionStrategy} disabled={auctionLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg mt-6 disabled:opacity-50 text-sm transition-all">
          {auctionLoading ? "Running Groq AI..." : "Formulate Strategy"}
        </button>
      </div>
      
      <div className="md:col-span-2 space-y-6">
        {auctionLoading && <div className="animate-pulse bg-slate-900 h-64 rounded-xl border border-slate-800"></div>}
        
        {auctionData && !auctionLoading && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" /> Recommended Bidding Targets
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {auctionData.primary_targets?.map((target: any, i: number) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-white text-base">{target.name}</h4>
                      <p className="text-xs text-purple-400 mb-2">{target.role}</p>
                      <p className="text-sm text-slate-400">{target.strategic_fit_rationale}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs block text-slate-500 uppercase font-bold mb-1">Max Bid</span>
                      <span className="text-xl font-mono font-bold text-emerald-400">{target.recommended_max_bid_lakhs}L</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <h4 className="text-sm font-bold text-slate-300 mb-2">Budget Strategy</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{auctionData.budget_allocation_advice}</p>
              </div>
              <div className="bg-red-950/20 border border-red-900/50 p-5 rounded-xl">
                <h4 className="text-sm font-bold text-red-400 mb-2">Risk Assessment</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{auctionData.risk_assessment}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}