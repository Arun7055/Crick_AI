"use client";

import { useState, useEffect } from "react";
import { Target, MapPin, Trophy, Swords, Users, ShieldAlert } from "lucide-react";
import PlayerCardModal from "@/components/PlayerCardModal";

interface Player {
  id: string;
  name: string;
  role: string;
}

export default function SelectionPage() {
  // Core Match Configuration States
  const [players, setPlayers] = useState<Player[]>([]);
  const [venue, setVenue] = useState("Wankhede Stadium, Mumbai");
  const [format, setFormat] = useState("T20");
  
  // New Interactive Selection States
  const [oppositionPlayers, setOppositionPlayers] = useState<string[]>([]);
  const [squadPlayers, setSquadPlayers] = useState<string[]>([]);
  
  // Control & Error States
  const [selectionData, setSelectionData] = useState<any>(null);
  const [selectionLoading, setSelectionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inspectedPlayer, setInspectedPlayer] = useState<string | null>(null);

  // Fetch lightweight player roster on load from your existing backend route
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/team/players")
      .then((res) => res.json())
      .then((data) => { 
        if (Array.isArray(data)) setPlayers(data); 
      })
      .catch((err) => {
        console.error("Failed to fetch players:", err);
        setErrorMessage("Could not load roster data from the server.");
      });
  }, []);

  // Dynamic Filtering Layers: Prevents a player from being in both pools simultaneously
  const availableForOpposition = players.filter(p => !squadPlayers.includes(p.name));
  const availableForSquad = players.filter(p => !oppositionPlayers.includes(p.name));

  // Toggling handlers for lists
  const handleToggleOpposition = (name: string) => {
    setErrorMessage(null);
    if (oppositionPlayers.includes(name)) {
      setOppositionPlayers(oppositionPlayers.filter(p => p !== name));
    } else {
      if (oppositionPlayers.length >= 11) {
        setErrorMessage("You can only select exactly 11 players for the Opposition lineup.");
        return;
      }
      setOppositionPlayers([...oppositionPlayers, name]);
    }
  };

  const handleToggleSquad = (name: string) => {
    setErrorMessage(null);
    if (squadPlayers.includes(name)) {
      setSquadPlayers(squadPlayers.filter(p => p !== name));
    } else {
      if (squadPlayers.length >= 25) {
        setErrorMessage("Your available squad pool cannot exceed 25 players.");
        return;
      }
      setSquadPlayers([...squadPlayers, name]);
    }
  };

  const generateTeam = async () => {
    // Structural Guard Checks
    if (oppositionPlayers.length !== 11) {
      setErrorMessage(`Please select exactly 11 opposition players (Currently selected: ${oppositionPlayers.length}).`);
      return;
    }
    if (squadPlayers.length < 12) {
      setErrorMessage(`Please select a squad pool of at least 12 players (Currently selected: ${squadPlayers.length}).`);
      return;
    }

    setSelectionLoading(true);
    setErrorMessage(null);
    
    try {
      // Points to your backend matchup route using the strict MatchupSelectionRequest schema
      const res = await fetch("http://127.0.0.1:8000/api/v1/team/matchup-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venue,
          format,
          opposition_players: oppositionPlayers,
          squad_players: squadPlayers
        })
      });

      if (!res.ok) {
        const errDetails = await res.json();
        throw new Error(errDetails.detail || "Selection compilation failed.");
      }

      const data = await res.json();
      setSelectionData(data);
    } catch (error: any) {
      console.error("Selection failed:", error);
      setErrorMessage(error.message || "An unexpected error occurred during tactical optimization.");
    } finally {
      setSelectionLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* LEFT COLUMN: PARAMETERS & SELECTION ACTIONS */}
      <div className="lg:col-span-1 space-y-4 bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="text-blue-500 w-5 h-5" /> Match Parameters
        </h2>
        
        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-red-400 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <label className="text-xs text-slate-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Venue / Conditions</label>
          <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>
        
        <div>
          <label className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Trophy className="w-3 h-3"/> Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500">
            <option value="T20">T20</option>
            <option value="ODI">ODI</option>
            <option value="Test">Test</option>
          </select>
        </div>

        {/* INTERACTIVE POOL SELECTION ARRAYS */}
        <div className="space-y-3 pt-2">
          <div>
            <span className="text-xs font-semibold text-red-400 block mb-1.5">
              Opposition Playing XI ({oppositionPlayers.length}/11)
            </span>
            <div className="h-44 overflow-y-auto border border-slate-800 rounded-lg p-2 space-y-1 bg-slate-950 custom-scrollbar">
              {availableForOpposition.map((player) => {
                const isSelected = oppositionPlayers.includes(player.name);
                return (
                  <button
                    key={`opp-${player.id}`}
                    onClick={() => handleToggleOpposition(player.name)}
                    className={`w-full text-left text-xs p-2 rounded transition-colors flex justify-between items-center ${
                      isSelected ? "bg-red-950/40 border border-red-900/40 text-red-200" : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <span>{player.name}</span>
                    <span className="text-[10px] text-slate-500">{player.role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-green-400 block mb-1.5">
              Your Squad Pool ({squadPlayers.length} Selected)
            </span>
            <div className="h-44 overflow-y-auto border border-slate-800 rounded-lg p-2 space-y-1 bg-slate-950 custom-scrollbar">
              {availableForSquad.map((player) => {
                const isSelected = squadPlayers.includes(player.name);
                return (
                  <button
                    key={`squad-${player.id}`}
                    onClick={() => handleToggleSquad(player.name)}
                    className={`w-full text-left text-xs p-2 rounded transition-colors flex justify-between items-center ${
                      isSelected ? "bg-green-950/40 border border-green-900/40 text-green-200" : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <span>{player.name}</span>
                    <span className="text-[10px] text-slate-500">{player.role}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button 
          onClick={generateTeam} 
          disabled={selectionLoading || oppositionPlayers.length !== 11 || squadPlayers.length < 12} 
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {selectionLoading ? "AI Evaluating Matchups..." : "Draft Optimal Playing XI"}
        </button>
      </div>

      {/* RIGHT COLUMN: REASONING & OUTPUT DISPLAY */}
      <div className="lg:col-span-2 space-y-6">
        {selectionLoading && <div className="animate-pulse bg-slate-900 h-96 rounded-xl border border-slate-800"></div>}
        
        {selectionData && !selectionLoading && (
          <>
            <div className="bg-blue-900/20 border border-blue-900/50 rounded-xl p-5">
              <h3 className="text-blue-400 font-bold text-sm uppercase mb-2">Coach's Tactical Summary</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{selectionData.match_strategy_summary}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" /> Selected Playing XI
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectionData.playing_xi?.map((player: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-start gap-3 hover:border-slate-700 transition-colors" onClick={() => setInspectedPlayer(player.name)}>
                    <div className="bg-slate-800 text-slate-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{player.name}</p>
                      <p className="text-xs text-blue-400 mb-1">{player.role}</p>
                      <p className="text-xs text-slate-400 leading-normal">{player.tactical_reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
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