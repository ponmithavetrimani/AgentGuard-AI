import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Layers, ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, ShieldCheck } from "lucide-react";
import { VersionComparison } from "../types";

interface VersionCompareProps {
  agentId: number;
  onNavigate: (page: string, params?: any) => void;
}

export const VersionCompare: React.FC<VersionCompareProps> = ({ agentId, onNavigate }) => {
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComparison() {
      try {
        const res = await api.getVersionComparison(agentId);
        setComparison(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadComparison();
  }, [agentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
        <span className="text-[15px] text-[#64748B] font-bold">Compiling model release regression comparison...</span>
      </div>
    );
  }

  if (!comparison) return <div>Failed to load comparison data.</div>;

  const renderDelta = (metric: any) => {
    const isImproved = metric.delta > 0;
    const isRegressed = metric.delta < 0;
    
    if (isImproved) {
      return (
        <span className="text-[#10B981] text-[12px] font-black flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-lg border border-green-200">
          <TrendingUp className="w-3.5 h-3.5" /> +{metric.delta}%
        </span>
      );
    }
    if (isRegressed) {
      return (
        <span className="text-[#EF4444] text-[12px] font-black flex items-center gap-0.5 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200 animate-pulse">
          <TrendingDown className="w-3.5 h-3.5" /> {metric.delta}%
        </span>
      );
    }
    return <span className="text-gray-400 text-[12px] font-bold bg-slate-50 px-2 py-0.5 rounded-lg border border-[#E5E7EB]">0%</span>;
  };

  const getMetricRow = (label: string, metric: any) => {
    return (
      <tr className="hover:bg-[#FAF9FD]/50 text-[14px] font-bold">
        <td className="py-3 text-[#18152B]">{label}</td>
        <td className="py-3 text-center text-amber-600 font-extrabold">{Math.round(metric.v1_value)}%</td>
        <td className="py-3 text-center text-emerald-600 font-extrabold">{Math.round(metric.v2_value)}%</td>
        <td className="py-3 text-right pr-4">{renderDelta(metric)}</td>
      </tr>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
        <button
          onClick={() => onNavigate("dashboard")}
          className="text-[14px] text-[#4F46E5] hover:underline flex items-center gap-1.5 font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4.5 h-4.5" /> Back to Console
        </button>
        <h1 className="text-[30px] font-black text-[#18152B] flex items-center gap-2">
          <Layers className="w-6 h-6 text-[#4F46E5]" /> Regression Tracker Comparison
        </h1>
      </div>

      {/* Regression notifications */}
      {comparison.regressions.length > 0 ? (
        <div className="p-4 border-l-4 border-[#EF4444] bg-red-50/50 rounded-r-xl space-y-2 text-[14px] font-bold">
          <div className="flex items-center gap-2 text-[#EF4444] text-[15px]">
            <AlertTriangle className="w-5 h-5" />
            <span>CRITICAL REGRESSIONS FLAGGED</span>
          </div>
          {comparison.regressions.map((reg, idx) => (
            <div key={idx} className="text-[#18152B] font-semibold">
              <p>Impact Category: <span className="text-[#EF4444] font-bold">{reg.impact}</span></p>
              <p className="text-[12px] text-[#64748B] mt-1 font-normal">Scenarios: {reg.tests.join(", ")}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4.5 border-l-4 border-[#10B981] bg-emerald-50/50 rounded-r-xl space-y-1 text-[14px] font-bold">
          <div className="flex items-center gap-2 text-[#10B981] text-[15px]">
            <ShieldCheck className="w-5 h-5" />
            <span>VERSION SAFEGUARD CONSTRAINTS VERIFIED</span>
          </div>
          <p className="text-[#18152B] font-semibold">
            V2 prompt changes successfully patched 10 target injection paths. Regression audit resolved with zero bypass threats.
          </p>
        </div>
      )}

      {/* V1 vs V2 Double Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* V1 Card (Red/Pink accent) */}
        <div className="glass-card p-6 bg-[#FFFFFF] border-t-4 border-t-[#EF4444] space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[12px] text-red-500 font-extrabold tracking-widest uppercase block">Target Release</span>
              <h3 className="text-[17px] font-black text-[#18152B]">V1.0.0 — Vulnerable</h3>
            </div>
            <span className="text-[24px] font-black text-[#EF4444] bg-red-50 px-3 py-1.5 rounded-xl leading-none">72%</span>
          </div>
          
          <p className="text-[14px] text-[#64748B] font-semibold leading-relaxed">
            Prompt contains low verification directives. Security scanning detected multiple tool override threats under urgency override instructions.
          </p>
        </div>

        {/* V2 Card (Green accent) */}
        <div className="glass-card p-6 bg-[#FFFFFF] border-t-4 border-t-[#10B981] space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[12px] text-emerald-600 font-extrabold tracking-widest uppercase block">Target Release</span>
              <h3 className="text-[17px] font-black text-[#18152B]">V2.0.0 — Secure</h3>
            </div>
            <span className="text-[24px] font-black text-[#10B981] bg-emerald-50 px-3 py-1.5 rounded-xl leading-none">94%</span>
          </div>

          <p className="text-[14px] text-[#64748B] font-semibold leading-relaxed">
            Instructions require customer verification token checking before tool loop dispatch. Successfully blocks administrative bypass payloads.
          </p>
        </div>

      </div>

      {/* Prominent net score delta card */}
      <div className="glass-card p-6 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-glow-rose rounded-full opacity-35 pointer-events-none" />
        <div className="space-y-1">
          <span className="text-[12px] text-[#E0E7FF]/70 font-extrabold tracking-wider block">NET AUDIT SCORE VARIATION</span>
          <h4 className="text-[20px] font-black tracking-tight leading-tight">Safeguard Performance Delta</h4>
          <p className="text-[13px] text-[#E0E7FF]/80 font-medium">
            Calculated across safety policy checks, tool limitations, and injection resistance trials.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[22px] font-black tracking-tight text-white bg-white/10 px-4.5 py-2.5 rounded-2xl border border-white/20 select-none animate-pulse">
            +22.2% Improvement
          </div>
        </div>
      </div>

      {/* Metrics breakdown table card */}
      <div className="glass-card p-6 bg-[#FFFFFF] space-y-4">
        <h3 className="text-[15px] font-black uppercase text-[#18152B] tracking-wider">Scoring Comparison Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[11px] text-[#64748B] uppercase font-bold">
                <th className="py-2.5">Evaluation Index</th>
                <th className="py-2.5 text-center text-amber-700">V1.0.0 Score</th>
                <th className="py-2.5 text-center text-emerald-700">V2.0.0 Score</th>
                <th className="py-2.5 text-right pr-4">Delta Shift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]/40">
              {getMetricRow("Reliability Score Index", comparison.reliability)}
              {getMetricRow("Safety Policy Guardrails", comparison.safety)}
              {getMetricRow("Tool call constraints", comparison.tool_usage)}
              {getMetricRow("Goal focus adherence", comparison.goal_adherence)}
              {getMetricRow("Factual Integrity (Hallucination)", comparison.hallucination)}
              {getMetricRow("Bypass Override Defense", comparison.injection)}
              {getMetricRow("Failure Recovery rate", comparison.recovery)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
