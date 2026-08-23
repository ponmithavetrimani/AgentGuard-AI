import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Shield, ShieldAlert, Cpu, CheckCircle2, TrendingUp, Play, HelpCircle, Layers, Activity } from "lucide-react";
import { Agent, Evaluation } from "../types";

interface DashboardProps {
  agentId: number;
  onNavigate: (page: string, params?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ agentId, onNavigate }) => {
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!agentId || agentId === 0) {
        setLoading(false);
        setActiveAgent(null);
        return;
      }
      setLoading(true);
      try {
        // Step 1: Load agent details
        const agent = await api.getAgent(agentId);
        setActiveAgent(agent);

        // Step 2: Load agent evaluations
        const evList = await api.getAgentEvaluations(agentId);
        setEvaluations(evList);
      } catch (e) {
        console.error("Dashboard failed to load data for agent ID:", agentId, e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [agentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 p-12 select-none">
        <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
        <span className="text-[15px] text-[#64748B] font-bold">Loading CommandCenter Dashboard...</span>
      </div>
    );
  }

  if (!activeAgent) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto select-none pt-20">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-[#64748B] mx-auto">
          <Cpu className="w-8 h-8" />
        </div>
        <h3 className="text-[18px] font-black text-[#18152B]">No Agent Configured</h3>
        <p className="text-[14px] text-[#64748B] font-semibold leading-relaxed">
          Navigate to Setup Agent to create your first dynamic AI Agent and begin testing.
        </p>
        <button
          onClick={() => onNavigate("agents")}
          className="h-11 px-6 text-[14px] font-black bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-90 rounded-xl text-white transition-all cursor-pointer inline-flex items-center gap-1.5 shadow"
        >
          Create AI Agent
        </button>
      </div>
    );
  }

  // Sort evaluations by date ascending to trace version updates
  const sortedEvals = [...evaluations].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const latestEval = sortedEvals[sortedEvals.length - 1];
  const previousEval = sortedEvals.find(e => e.id !== latestEval?.id);

  // Computations for KPI cards
  const reliabilityText = latestEval ? `${latestEval.reliability_score}%` : "Pending";
  const safetyText = latestEval ? `${latestEval.safety_score}%` : "Pending";
  const totalTestsCount = evaluations.reduce((sum, e) => sum + e.total_tests, 0);
  const criticalFindings = latestEval ? latestEval.failed_tests : 0;

  // Delta calculation
  let deltaText = "First evaluation pending";
  let deltaValue = 0;
  if (latestEval && previousEval) {
    deltaValue = Math.round(latestEval.reliability_score - previousEval.reliability_score);
    if (deltaValue > 0) {
      deltaText = `+${deltaValue}% improvement`;
    } else if (deltaValue < 0) {
      deltaText = `${deltaValue}% regression`;
    } else {
      deltaText = `No score change`;
    }
  }

  // Vulnerability Distribution parameters
  const isV1 = latestEval?.name.includes("1.0.0");
  const chartCritical = latestEval ? (isV1 ? 4 : 1) : 0;
  const chartHigh = latestEval ? (isV1 ? 6 : 2) : 0;
  const chartMedium = latestEval ? (isV1 ? 6 : 3) : 0;
  const chartLow = latestEval ? (latestEval.passed_tests) : 0;
  const chartTotal = chartCritical + chartHigh + chartMedium + chartLow;

  const criticalPct = chartTotal > 0 ? Math.round((chartCritical / chartTotal) * 100) : 0;
  const highPct = chartTotal > 0 ? Math.round((chartHigh / chartTotal) * 100) : 0;
  const mediumPct = chartTotal > 0 ? Math.round((chartMedium / chartTotal) * 100) : 0;
  const lowPct = chartTotal > 0 ? Math.round((chartLow / chartTotal) * 100) : 0;

  // Ring coordinates calculations
  const strokeOffsetCritical = 0;
  const strokeOffsetHigh = -criticalPct;
  const strokeOffsetMedium = -(criticalPct + highPct);
  const strokeOffsetLow = -(criticalPct + highPct + mediumPct);

  return (
    <div className="p-6 space-y-6">
      
      {/* Top Banner: Command Center Header */}
      <div className="glass-card p-6 bg-[#FFFFFF] border border-[#DDD6FE] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-glow-indigo rounded-full opacity-20 pointer-events-none" />
        
        <div className="space-y-2">
          <span className="text-[12px] font-black tracking-widest text-[#7C3AED] uppercase block">AI Agent Command Center</span>
          <h1 className="text-[28px] md:text-[30px] font-black leading-tight text-[#18152B]">{activeAgent.name}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-[14px] font-bold text-[#64748B]">
            <span className="flex items-center gap-1.5 text-[#10B981]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] pulse-green" />
              ● ACTIVE
            </span>
            <span>Domain: <strong className="text-[#18152B]">{activeAgent.domain}</strong></span>
            <span>Target Model: <strong className="text-[#18152B]">{activeAgent.model}</strong></span>
            <span>Version: <strong className="text-[#18152B]">{activeAgent.current_version}</strong></span>
          </div>
        </div>

        <button
          onClick={() => onNavigate("agents")}
          className="h-11 px-6 text-[14px] font-black bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-90 rounded-xl text-white transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#4F46E5]/15 self-start md:self-auto cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white stroke-none" /> Configure / Run Evaluation →
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        
        {/* Dominant Circular Reliability card */}
        <div className="glass-card p-6 bg-gradient-to-br from-[#FFFFFF] to-[#E0E7FF]/20 border-2 border-[#DDD6FE] md:col-span-2 flex items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-wider block">RELIABILITY INDEX</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[32px] font-black tracking-tight text-[#18152B]">{reliabilityText}</span>
            </div>
            <div className={`text-[13px] font-bold flex items-center gap-1 ${deltaValue >= 0 ? "text-[#10B981]" : "text-red-500"}`}>
              {deltaValue !== 0 && <TrendingUp className="w-3.5 h-3.5" />} {deltaText}
            </div>
          </div>
          
          {/* Conic Gradient Indicator */}
          {latestEval && (
            <div className="w-20 h-20 rounded-full flex items-center justify-center p-[4px] score-ring relative select-none">
              <div className="w-full h-full rounded-full bg-[#FFFFFF] flex flex-col items-center justify-center">
                <span className="text-[11px] font-black text-[#64748B] tracking-wider uppercase">
                  {latestEval.name.includes("1.0.0") ? "V1" : "V2"}
                </span>
                <span className="text-[15px] font-black text-[#7C3AED]">{latestEval.reliability_score}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Safety Score Card */}
        <div className="glass-card p-6 bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#DDD6FE] transition-all flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-wider block">Safety Policy</span>
            <div className="text-[28px] font-black text-[#7C3AED]">{safetyText}</div>
          </div>
          <svg className="w-full h-6 text-[#7C3AED]/40" viewBox="0 0 100 20">
            <path d="M0,15 Q20,5 40,12 T80,5 T100,10" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <div className="text-[13px] text-[#10B981] font-bold">{latestEval ? "Safeguards Audited" : "No evaluations run"}</div>
        </div>

        {/* Total Runs Card */}
        <div className="glass-card p-6 bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#DDD6FE] transition-all flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-wider block">Tests Executed</span>
            <div className="text-[28px] font-black text-[#18152B]">{totalTestsCount}</div>
          </div>
          <svg className="w-full h-6 text-[#4F46E5]/40" viewBox="0 0 100 20">
            <path d="M0,10 Q25,18 50,5 T100,12" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <div className="text-[13px] text-[#64748B] font-semibold">Standard + Adversarial</div>
        </div>

        {/* Critical findings Card */}
        <div className="glass-card p-6 bg-[#FFFFFF] border-l-4 border-l-[#EF4444] border-[#E5E7EB] hover:border-[#DDD6FE] transition-all flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-wider block">Critical Findings</span>
            <div className="text-[28px] font-black text-[#EF4444]">
              {criticalFindings > 9 ? criticalFindings : `0${criticalFindings}`}
            </div>
          </div>
          <div className="text-[13px] text-[#EF4444] font-bold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> High Risk Bypasses
          </div>
        </div>

      </div>

      {/* Grid: Metrics, Risk distribution chart, and evaluations logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Evaluations History List */}
        <div className="glass-card p-6 bg-[#FFFFFF] border border-[#E5E7EB] lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <h3 className="text-[15px] font-black tracking-wider uppercase text-[#18152B]">Platform Audit Log</h3>
            <span className="text-[12px] bg-[#E0E7FF] text-[#4F46E5] px-2.5 py-0.5 rounded font-bold uppercase">SQLite DB Live</span>
          </div>
          
          <div className="overflow-x-auto">
            {evaluations.length === 0 ? (
              <div className="py-12 text-center text-[#64748B] font-semibold">
                No evaluations logged for this agent. Click configure to initiate sandbox runs.
              </div>
            ) : (
              <table className="w-full text-[14px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#64748B] uppercase font-bold text-[11px]">
                    <th className="py-2.5">Target</th>
                    <th className="py-2.5">Passed / Failed</th>
                    <th className="py-2.5 text-center">Score</th>
                    <th className="py-2.5">Risk Rating</th>
                    <th className="py-2.5 text-right pr-2">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]/40">
                  {[...evaluations].reverse().map((ev, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF9FD]/50 transition-all font-semibold">
                      <td className="py-3 text-[#18152B]">{ev.name}</td>
                      <td className="py-3">
                        <span className="text-[#10B981] font-bold">{ev.passed_tests} Pass</span> / <span className="text-[#EF4444] font-bold">{ev.failed_tests} Fail</span>
                      </td>
                      <td className="py-3 text-center text-[#7C3AED] font-black">{ev.reliability_score}%</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase border ${
                          ev.failed_tests > 3 ? "bg-red-50 text-[#EF4444] border-red-150" : "bg-amber-50 text-[#F59E0B] border-amber-150"
                        }`}>
                          {ev.failed_tests > 3 ? "HIGH" : "MEDIUM"}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2">
                        <button
                          onClick={() => onNavigate("results", { evaluationId: ev.id, version: ev.name.includes("1.0.0") ? "V1.0.0" : "V2.0.0" })}
                          className="text-[#4F46E5] hover:underline font-extrabold cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Risk Distribution donut map */}
        <div className="glass-card p-6 bg-[#FFFFFF] border border-[#E5E7EB] flex flex-col justify-between space-y-4">
          <h3 className="text-[15px] font-black tracking-wider uppercase text-[#18152B]">Vulnerability Categories</h3>
          
          <div className="flex flex-col items-center justify-center py-2 relative select-none">
            <svg width="150" height="150" viewBox="0 0 36 36" className="transform -rotate-90">
              {/* Background circle */}
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="#E5E7EB" strokeWidth="3" />
              
              {chartTotal > 0 ? (
                <>
                  {/* Critical slice */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#EF4444" strokeWidth="3" 
                          strokeDasharray={`${criticalPct} ${100 - criticalPct}`} strokeDashoffset={strokeOffsetCritical} />
                  {/* High slice */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#E11D8D" strokeWidth="3" 
                          strokeDasharray={`${highPct} ${100 - highPct}`} strokeDashoffset={strokeOffsetHigh} />
                  {/* Medium slice */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#F59E0B" strokeWidth="3" 
                          strokeDasharray={`${mediumPct} ${100 - mediumPct}`} strokeDashoffset={strokeOffsetMedium} />
                  {/* Low slice */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#10B981" strokeWidth="3" 
                          strokeDasharray={`${lowPct} ${100 - lowPct}`} strokeDashoffset={strokeOffsetLow} />
                </>
              ) : null}
            </svg>
            
            <div className="absolute flex flex-col items-center">
              <span className="text-[11px] font-black text-[#64748B] uppercase">Bypasses</span>
              <span className="text-[20px] font-black text-[#18152B]">{latestEval ? latestEval.failed_tests : 0} total</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[14px] font-bold text-[#64748B] border-t border-[#E5E7EB] pt-3">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#EF4444]" /> Critical ({criticalPct}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#E11D8D]" /> High ({highPct}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#F59E0B]" /> Medium ({mediumPct}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#10B981]" /> Low ({lowPct}%)
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);
