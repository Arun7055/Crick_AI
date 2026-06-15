"use client";

import { useState, useEffect } from "react";
import { Target, MapPin, Trophy, Swords, Users } from "lucide-react";

export default function SelectionPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [venue, setVenue] = useState("Wankhede Stadium, Mumbai");
  const [format, setFormat] = useState("T20");
  const [opposition, setOpposition] = useState("Chennai Super Kings");
  const [selectionData, setSelectionData] = useState<any>(null);
  const [selectionLoading, setSelectionLoading] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/team/players")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setPlayers(data); })
      .catch((err) => console.error("Failed to fetch players:", err));
  }, []);

  const generateTeam = async () => {
    setSelectionLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/team/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venue, format, opposition,
          available_players: players.map(p => p.name).length > 0 ? players.map(p => p.name) : ["Virat Kohli", "Jasprit Bumrah", "Rohit Sharma"] 
        })
      });
      const data = await res.json();
      setSelectionData(data);
    } catch (error) {
      console.error("Selection failed:", error);
    }
    setSelectionLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-1 space-y-4 bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="text-blue-500 w-5 h-5" /> Match Parameters
        </h2>
        
        <div>
          <label className="text-xs text-slate-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Venue</label>
          <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm" />
        </div>
        
        <div>
          <label className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Trophy className="w-3 h-3"/> Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm">
            <option value="T20">T20</option>
            <option value="ODI">ODI</option>
            <option value="Test">Test</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Swords className="w-3 h-3"/> Opposition</label>
          <input type="text" value={opposition} onChange={(e) => setOpposition(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm" />
        </div>

        <button onClick={generateTeam} disabled={selectionLoading} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg shadow-lg transition-all disabled:opacity-50 text-sm">
          {selectionLoading ? "AI Evaluating Matchups..." : "Draft Optimal Playing XI"}
        </button>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {selectionLoading && <div className="animate-pulse bg-slate-900 h-96 rounded-xl border border-slate-800"></div>}
        
        {selectionData && !selectionLoading && (
          <>
            <div className="bg-blue-900/20 border border-blue-900/50 rounded-xl p-5">
              <h3 className="text-blue-400 font-bold text-sm uppercase mb-2">Coach's Tactical Summary</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{selectionData.tactical_summary}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> Final Playing XI</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectionData.playing_xi.map((player: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-start gap-3 hover:border-slate-700 transition-colors">
                    <div className="bg-slate-800 text-slate-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{player.name}</p>
                      <p className="text-xs text-blue-400 mb-1">{player.role}</p>
                      <p className="text-xs text-slate-400">{player.matchup_rationale}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}