import Link from "next/link";
import { Users, HeartPulse, Gavel, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-in fade-in duration-700">
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-5xl font-extrabold text-white tracking-tight">
          Next-Generation <span className="text-blue-500">Cricket Intelligence</span>
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          The ultimate multi-agent intelligence platform for professional sports franchises. 
          Leverage Groq AI and Machine Learning for tactical squad building, injury tracking, and auction strategy.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-8">
        <Link href="/selection" className="group bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-xl p-6 transition-all text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-24 h-24" />
          </div>
          <Users className="w-8 h-8 text-blue-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Match Selection</h3>
          <p className="text-sm text-slate-400 mb-6">Draft tactical Playing XIs using advanced AI matchup analysis.</p>
          <span className="text-blue-500 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">Launch Tool <ArrowRight className="w-4 h-4"/></span>
        </Link>

        <Link href="/durability" className="group bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-xl p-6 transition-all text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <HeartPulse className="w-24 h-24" />
          </div>
          <HeartPulse className="w-8 h-8 text-emerald-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Durability Tracker</h3>
          <p className="text-sm text-slate-400 mb-6">Monitor player workloads via XGBoost injury prediction models.</p>
          <span className="text-emerald-500 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">Launch Tool <ArrowRight className="w-4 h-4"/></span>
        </Link>

        <Link href="/auction" className="group bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-xl p-6 transition-all text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Gavel className="w-24 h-24" />
          </div>
          <Gavel className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Auction Room</h3>
          <p className="text-sm text-slate-400 mb-6">Formulate budget strategies and maximize purse ROI.</p>
          <span className="text-purple-500 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">Launch Tool <ArrowRight className="w-4 h-4"/></span>
        </Link>
      </div>
    </div>
  );
}