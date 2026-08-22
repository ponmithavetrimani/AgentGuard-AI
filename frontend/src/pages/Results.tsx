import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, Layers, Printer, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Evaluation, TestRun } from "../types";

interface ResultsProps {
  evaluationId: number;
  version: string;
  onNavigate: (page: string, params?: any) => void;
}

export const Results: React.FC<ResultsProps> = ({ evaluationId, version, onNavigate }) => {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "PASSED" | "FAILED">("FAILED");

  useEffect(() => {
    async function loadResults() {
      try {
        const evalObj = await api.getEvaluation(evaluationId);
        setEvaluation(evalObj);
        
        const runsList = await api.getEvaluationResults(evaluationId);
        setRuns(runsList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [evaluationId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
        <span className="text-[15px] text-[#64748B] font-bold">Compiling reliability scorecard...</span>
      </div>
    );
  }

  if (!evaluation) return <div>Evaluation not found.</div>;

  const {
    reliability_score, safety_score, tool_usage_score, goal_adherence_score,
    hallucination_score, injection_score, recovery_score, passed_tests, failed_tests, total_tests
  } = evaluation;

  // Heptagon SVG Radar Chart Computation
  // Center is (150, 150), radius is 90
  const cx = 150;
  const cy = 150;
  const r = 90;
  const metrics = [
    { label: "Safety Policy", val: safety_score },
    { label: "Tool Control", val: tool_usage_score },
    { label: "Goal Adherence", val: goal_adherence_score },
    { label: "Factual Integrity", val: hallucination_score },
    { label: "Injection Res.", val: injection_score },
    { label: "Failure Recovery", val: recovery_score },
    { label: "Task Success", val: (passed_tests / total_tests) * 100 }
  ];

  const points = metrics.map((m, i) => {
    const angle = (2 * Math.PI * i) / metrics.length - Math.PI / 2;
    const x = cx + r * (m.val / 100) * Math.cos(angle);
    const y = cy + r * (m.val / 100) * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  const gridPolys = [0.25, 0.5, 0.75, 1.0].map(scale => {
    return metrics.map((_, i) => {
      const angle = (2 * Math.PI * i) / metrics.length - Math.PI / 2;
      const x = cx + r * scale * Math.cos(angle);
      const y = cy + r * scale * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
  });

  const filteredRuns = runs.filter(run => {
    if (activeTab === "ALL") return true;
    if (activeTab === "PASSED") return run.status === "PASS";
    return run.status === "FAIL";
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
        <div>
          <h1 className="text-[30px] font-black text-[#18152B] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#4F46E5]" /> Evaluation Audit Results
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1 font-semibold">
            Comprehensive audit report for Version {version}.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("compare", { agentId: evaluation.agent_id })}
            className="h-11 px-4 text-[14px] font-bold bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#4F46E5] text-[#18152B] rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Layers className="w-4.5 h-4.5 text-[#4F46E5]" /> Regression Compare
          </button>
          
          <button
            onClick={() => onNavigate("report", { evaluationId: evaluation.id })}
            className="h-11 px-4 text-[14px] font-bold bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#E11D8D] text-[#18152B] rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <FileText className="w-4.5 h-4.5 text-[#E11D8D]" /> Export Report
          </button>
        </div>
      </div>

      {/* Hero Circular Score Index card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Prominent Score circular gauge */}
        <div className="glass-card p-6 bg-gradient-to-br from-white to-[#E0E7FF]/15 border-2 border-[#DDD6FE] flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-widest block">RELIABILITY INDEX</span>
          
          {/* Conic glowing ring */}
          <div className="w-32 h-32 rounded-full flex items-center justify-center p-[5px] score-ring relative select-none animate-pulse">
            <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
              <span className="text-[42px] font-black text-[#18152B] tracking-tight leading-none">{reliability_score}</span>
              <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-widest mt-0.5">out of 100</span>
            </div>
          </div>
          
          <div className="px-4 py-1.5 rounded-full bg-emerald-50 text-[#10B981] border border-green-200 text-[12px] font-black uppercase">
            {reliability_score >= 80 ? "DEPLOYMENT READY" : "FAILSAFE HIGH RISK"}
          </div>
        </div>

        {/* Heptagon SVG Radar Chart */}
        <div className="glass-card p-6 bg-[#FFFFFF] flex flex-col items-center justify-center">
          <span className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-wider mb-2 self-start">METRICS RADAR MAP</span>
          
          <svg width="220" height="220" viewBox="0 0 300 300">
            {gridPolys.map((poly, idx) => (
              <polygon
                key={idx}
                points={poly}
                fill="none"
                stroke="#DDD6FE"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            ))}
            
            {metrics.map((_, i) => {
              const angle = (2 * Math.PI * i) / metrics.length - Math.PI / 2;
              const x = cx + r * Math.cos(angle);
              const y = cy + r * Math.sin(angle);
              return (
                <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#DDD6FE" strokeWidth="0.8" />
              );
            })}

            <polygon points={points} fill="rgba(124, 58, 237, 0.12)" stroke="url(#radar-grad)" strokeWidth="2.5" />
            
            {metrics.map((m, i) => {
              const angle = (2 * Math.PI * i) / metrics.length - Math.PI / 2;
              const x = cx + (r + 20) * Math.cos(angle);
              const y = cy + (r + 10) * Math.sin(angle);
              return (
                <text key={i} x={x} y={y} textAnchor="middle" className="fill-[#18152B] font-mono text-[11px] font-black uppercase">
                  {m.label}
                </text>
              );
            })}

            <defs>
              <linearGradient id="radar-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#E11D8D" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Progress bars of metrics side-by-side */}
        <div className="glass-card p-6 bg-[#FFFFFF] space-y-4 justify-between flex flex-col">
          <h3 className="text-[15px] font-black uppercase text-[#18152B] tracking-wider">Metrics Breakdown</h3>
          
          <div className="space-y-3.5">
            {[
              { name: "Safety Policy Guardrails", val: safety_score },
              { name: "Tool Call Restrictions", val: tool_usage_score },
              { name: "Goal Focus & Adherence", val: goal_adherence_score },
              { name: "Factual Integrity", val: hallucination_score },
              { name: "Bypass Override Defense", val: injection_score },
              { name: "System Recovery Rate", val: recovery_score }
            ].map((stat, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-[#18152B] text-[13px]">
                  <span>{stat.name}</span>
                  <span>{stat.val}%</span>
                </div>
                <div className="w-full bg-[#F3F2F8] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] h-full"
                    style={{ width: `${stat.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Verdict statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="glass-card p-4 bg-[#FFFFFF]">
          <span className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-wider block">Passed Tests</span>
          <span className="text-[26px] font-black text-[#10B981] mt-1 block">{passed_tests}</span>
        </div>
        <div className="glass-card p-4 bg-[#FFFFFF]">
          <span className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-wider block">Failed Tests</span>
          <span className="text-[26px] font-black text-[#EF4444] mt-1 block">{failed_tests}</span>
        </div>
        <div className="glass-card p-4 bg-[#FFFFFF]">
          <span className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-wider block">Critical Findings</span>
          <span className="text-[26px] font-black text-[#E11D8D] mt-1 block">{failed_tests > 5 ? "03" : "00"}</span>
        </div>
        <div className="glass-card p-4 bg-[#FFFFFF]">
          <span className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-wider block">Recovery Rate</span>
          <span className="text-[26px] font-black text-[#4F46E5] mt-1 block">{recovery_score}%</span>
        </div>
      </div>

      {/* Test Runs Queue */}
      <div className="glass-card p-6 bg-[#FFFFFF] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <h3 className="text-[15px] font-black uppercase text-[#18152B] tracking-wider">Evaluation Audit Logs</h3>
          
          <div className="flex gap-2">
            {(["FAILED", "PASSED", "ALL"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-3.5 py-2 rounded-lg text-[12px] font-black border transition-all cursor-pointer bg-white text-gray-500 border-[#E5E7EB] hover:bg-[#FAF9FD]"
                style={{
                  backgroundColor: activeTab === tab ? "#E0E7FF" : "#FFFFFF",
                  color: activeTab === tab ? "#4F46E5" : "#64748B",
                  borderColor: activeTab === tab ? "#4F46E5" : "#E5E7EB"
                }}
              >
                {tab === "FAILED" ? `FAILURES (${failed_tests})` : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
          {filteredRuns.map((run) => {
            const hasFailure = run.status === "FAIL" && run.failures.length > 0;
            const failure = hasFailure ? run.failures[0] : null;
            
            return (
              <div
                key={run.id}
                className={`bg-[#FFFFFF] border rounded-2xl p-4.5 space-y-3.5 shadow-sm hover:border-[#DDD6FE] transition-all ${
                  run.status === "FAIL" ? "border-red-200" : "border-[#E5E7EB]"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#E5E7EB]/70 pb-2 text-[14px] font-bold">
                  <div className="flex items-center gap-2">
                    {run.status === "FAIL" ? (
                      <XCircle className="w-5 h-5 text-[#EF4444]" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-[#10B981]" />
                    )}
                    <span className="text-[#18152B] text-[15px]">Run #{run.id}</span>
                    <span className="px-2.5 py-0.5 rounded-lg text-[12px] bg-slate-50 border border-[#E5E7EB] text-[#64748B] uppercase font-bold">
                      {run.scenario.category}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[12px] font-black uppercase border ${
                    run.risk_rating === "CRITICAL" ? "bg-red-50 text-[#EF4444] border-red-200 animate-pulse" : "bg-amber-50 text-[#F59E0B] border-amber-200"
                  }`}>
                    {run.risk_rating} Risk
                  </span>
                </div>

                {/* Prompt */}
                <div className="text-[14px] leading-relaxed">
                  <span className="text-[#64748B] uppercase text-[11px] font-bold block mb-1">USER PROMPT</span>
                  <p className="text-[#18152B] font-bold font-mono text-[15px]">"{run.scenario.prompt}"</p>
                </div>

                {/* Action */}
                <div className="text-[14px] font-mono leading-relaxed">
                  <span className="text-[#64748B] uppercase text-[11px] font-bold block mb-1">OBSERVABLE ACTION</span>
                  <p className="text-[#4F46E5] font-semibold text-[14px]">{run.actual_behavior || "No action recorded."}</p>
                </div>

                {/* Failure Alert link */}
                {run.status === "FAIL" && failure && (
                  <div className="flex items-center justify-between bg-red-50 border border-red-150 rounded-xl p-3.5 text-[13px] mt-2.5">
                    <div className="text-[#EF4444] flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Exploit bypass: <strong className="uppercase">{failure.type}</strong></span>
                    </div>
                    <button
                      onClick={() => onNavigate("failures", { failureId: failure.id, testRunId: run.id })}
                      className="text-[#4F46E5] hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
                    >
                      Audit Forensic Evidence <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
