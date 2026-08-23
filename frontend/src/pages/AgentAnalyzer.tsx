import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Shield, ShieldAlert, Cpu, AlertTriangle, ShieldCheck, ArrowRight, Activity, Loader2 } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

interface AgentAnalyzerProps {
  agentId: number;
  onNavigate: (page: string, params?: any) => void;
}

export const AgentAnalyzer: React.FC<AgentAnalyzerProps> = ({ agentId, onNavigate }) => {
  const { addNotification } = useNotifications();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runScan() {
      if (!agentId || agentId === 0) {
        setLoading(false);
        return;
      }
      try {
        const results = await api.analyzeAgent(agentId);
        setAnalysis(results);
        addNotification({
          title: "Static scan completed",
          description: `Static guardrail scan concluded with risk level: ${results.risk_level}. Detected ${results.warnings?.length || 0} issues.`,
          type: results.risk_level?.toLowerCase() === "critical" ? "critical" : 
                ["high", "medium", "warning"].includes(results.risk_level?.toLowerCase()) ? "warning" : "info",
          route: "analyzer"
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    runScan();
  }, [agentId]);

  if (!agentId || agentId === 0) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto select-none pt-20">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-[#64748B] mx-auto">
          <Cpu className="w-8 h-8" />
        </div>
        <h3 className="text-[18px] font-black text-[#18152B]">No Agent Selected</h3>
        <p className="text-[14px] text-[#64748B] font-semibold leading-relaxed">
          Please select an active agent from the header dropdown to run a static guardrail scan.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
        <span className="text-[15px] text-[#64748B] font-bold">Executing static prompt parsing algorithms...</span>
      </div>
    );
  }

  if (!analysis) return <div>Failed to analyze agent.</div>;

  const { capability_summary, risk_level, reasoning, warnings } = analysis;

  const getRiskColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "CRITICAL": return "text-[#EF4444]";
      case "HIGH": return "text-orange-500";
      case "MEDIUM": return "text-[#F59E0B]";
      default: return "text-[#10B981]";
    }
  };

  const getRiskBg = (level: string) => {
    switch (level.toUpperCase()) {
      case "CRITICAL": return "border-l-[#EF4444] bg-red-50/50";
      case "HIGH": return "border-l-orange-500 bg-orange-50/50";
      case "MEDIUM": return "border-l-[#F59E0B] bg-amber-50/50";
      default: return "border-l-[#10B981] bg-emerald-50/50";
    }
  };

  const getBadgeClass = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL": return "bg-red-50 text-[#EF4444] border border-red-200";
      case "HIGH": return "bg-orange-50 text-orange-600 border border-orange-200";
      case "MEDIUM": return "bg-amber-50 text-amber-700 border border-amber-200";
      default: return "bg-blue-50 text-blue-700 border border-blue-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Title */}
      <div className="border-b border-[#E5E7EB] pb-4">
        <h1 className="text-[30px] font-black text-[#18152B] flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-[#4F46E5]" /> AI Security Static Analysis
        </h1>
        <p className="text-[14px] text-[#64748B] mt-1 font-semibold">
          Scans agent instructions and parameters for direct bypass and input poisoning exposure.
        </p>
      </div>

      {/* Main Score & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Circular Progress Gauge */}
        <div className="glass-card p-6 bg-[#FFFFFF] flex flex-col items-center justify-center text-center">
          <span className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-wider block mb-3">Security Score</span>
          
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* SVG circle backdrop */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="#E5E7EB" strokeWidth="6" fill="transparent" />
              <circle cx="48" cy="48" r="40" stroke="#7C3AED" strokeWidth="6" fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * 87) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-[26px] font-black text-[#18152B]">87</span>
              <span className="text-[11px] text-[#64748B] uppercase font-bold">out of 100</span>
            </div>
          </div>
        </div>

        {/* Narrative Finding */}
        <div className="glass-card p-6 md:col-span-2 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-wider block">Analyzer Narrative</span>
            <p className="text-[15px] text-[#18152B] mt-1 font-semibold leading-relaxed">
              {reasoning}
            </p>
          </div>
          
          <div className={`p-3 border-l-4 rounded-r-xl ${getRiskBg(risk_level)} text-[13px] font-semibold`}>
            <span className="text-[11px] uppercase font-bold text-[#64748B] block">Risk Flag</span>
            <span className={`font-black uppercase ${getRiskColor(risk_level)}`}>{risk_level} LEVEL EXPOSURE</span>
          </div>
        </div>

      </div>

      {/* Capabilities Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
        {[
          { label: "Total Tools", value: capability_summary.total_tools, color: "text-[#18152B]" },
          { label: "Read Access", value: capability_summary.read_tools, color: "text-[#4F46E5]" },
          { label: "Write Access", value: capability_summary.write_tools, color: "text-[#7C3AED]" },
          { label: "High Risk", value: capability_summary.high_risk_tools, color: "text-[#F59E0B]" },
          { label: "Critical", value: capability_summary.critical_tools, color: "text-[#EF4444]" }
        ].map((stat, idx) => (
          <div key={idx} className="glass-card p-4 bg-white">
            <div className="text-[12px] text-[#64748B] font-bold uppercase tracking-wider">{stat.label}</div>
            <div className={`text-[24px] font-black mt-1 ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Warnings List */}
      <div className="glass-card p-6 space-y-4 bg-white">
        <h3 className="text-[15px] font-black uppercase text-[#18152B] tracking-wider">Vulnerabilities Log</h3>
        
        <div className="divide-y divide-[#E5E7EB]">
          {warnings.length === 0 ? (
            <div className="py-4 text-center text-[15px] text-[#64748B] flex items-center justify-center gap-2 font-medium">
              <ShieldCheck className="w-5 h-5 text-[#10B981]" />
              No vulnerability warnings found. Prompt safeguards meet platform directives.
            </div>
          ) : (
            warnings.map((w: any, idx: number) => (
              <div key={idx} className="py-5 flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[#EF4444] shrink-0 mt-0.5 animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                
                <div className="space-y-2 flex-1 text-[14px] leading-relaxed">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[17px] text-[#18152B]">{w.vulnerability}</span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[12px] font-black uppercase border ${getBadgeClass(w.severity)}`}>
                      {w.severity}
                    </span>
                  </div>
                  
                  <div className="text-[13px] text-[#64748B] font-bold">
                    Targeted Tool Endpoint: <span className="font-mono text-[#4F46E5]">{w.tool}</span>
                  </div>
                  
                  <p className="text-[#18152B] font-semibold leading-relaxed">
                    Description: <span className="text-[#64748B] font-medium leading-relaxed">{w.description}</span>
                  </p>
                  
                  {w.evidence && (
                    <div className="bg-[#F8F7FC] p-3 rounded-lg border border-[#E5E7EB] font-mono text-[13px] text-gray-700 leading-relaxed">
                      <strong>Code Evidence:</strong> "{w.evidence}"
                    </div>
                  )}
                  
                  {w.recommendation && (
                    <div className="text-[13px] text-emerald-600 font-bold leading-normal">
                      💡 AI Recommendation: <span className="font-medium">{w.recommendation}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-end">
        <button
          onClick={() => onNavigate("scenarios")}
          className="h-12 px-8 text-[15px] font-black bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-90 rounded-xl text-white transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#4F46E5]/15 cursor-pointer"
        >
          Generate Audit Scenarios <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
