import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { ShieldAlert, Play, CheckCircle2, Copy, AlertTriangle, ArrowLeft, Terminal, HelpCircle, Info } from "lucide-react";
import { Failure, TestRun } from "../types";

interface FailureDetailsProps {
  failureId: number;
  testRunId: number;
  onNavigate: (page: string, params?: any) => void;
}

export const FailureDetails: React.FC<FailureDetailsProps> = ({ failureId, testRunId, onNavigate }) => {
  const [failure, setFailure] = useState<Failure | null>(null);
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [loading, setLoading] = useState(true);

  // Replay States
  const [replaying, setReplaying] = useState(false);
  const [replayLogs, setReplayLogs] = useState<string[]>([]);
  const [replayOutcome, setReplayOutcome] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      try {
        const failObj = await api.getFailureDetails(failureId);
        setFailure(failObj);

        // Fetch execution details
        const runs = await api.getEvaluationResults(failObj.test_run_id);
        const match = runs.find(r => r.id === failObj.test_run_id);
        if (match) setTestRun(match);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [failureId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
        <span className="text-[15px] text-[#64748B] font-bold">Compiling forensic logs & evidence details...</span>
      </div>
    );
  }

  if (!failure || !testRun) return <div>Failure record not found.</div>;

  const handleCopyRec = () => {
    const text = failure.recommendations.map(r => `- [${r.priority}] ${r.recommendation}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleTriggerReplay = () => {
    if (replaying) return;
    setReplaying(true);
    setReplayLogs([]);
    setReplayOutcome("");

    const streamUrl = api.getReplayStreamUrl(testRun.id);
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === "STARTING") {
          setReplayLogs(prev => [...prev, `[INIT] ${data.message}`]);
        } else if (data.status === "RUNNING") {
          setReplayLogs(prev => [...prev, `[${data.trace.type}] ${data.trace.message}`]);
        } else if (data.status === "COMPLETED") {
          setReplayOutcome(data.outcome);
          eventSource.close();
          setReplaying(false);
        }
      } catch (err) {
        console.error(err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setReplaying(false);
    };
  };

  const evidence = failure.evidence_items[0] || {
    rule_triggered: "RULE_SECURITY_AUDIT_01",
    observed_behavior: "Sensitive refund called without owner confirmation.",
    expected_behavior: "Secure authorization checks and identity token matching.",
    confidence: 0.95,
    reasoning_summary: failure.evidence_summary || "Bypass detected."
  };

  const risk = testRun.risk_assessment || {
    likelihood: "MEDIUM",
    impact: "HIGH",
    risk_level: failure.severity,
    potential_impact: failure.potential_impact || "Direct financial payouts bypass.",
    affected_tool: failure.affected_tool || "None"
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
        <button
          onClick={() => onNavigate("results", { evaluationId: testRun.evaluation_id })}
          className="text-[14px] text-[#4F46E5] hover:underline flex items-center gap-1 font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4.5 h-4.5" /> Back to Results
        </button>
        
        <button
          onClick={handleTriggerReplay}
          disabled={replaying}
          className="h-11 px-5 text-[14px] font-bold bg-[#4F46E5] hover:opacity-90 rounded-xl text-white flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" /> Replay Test Scenario
        </button>
      </div>

      {/* Headline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 space-y-2.5 md:col-span-2 bg-[#FFFFFF]">
          <span className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-wider block">Failure Classification</span>
          <h2 className="text-[20px] font-black text-[#18152B] uppercase leading-tight">{failure.type}</h2>
          <p className="text-[15px] text-[#18152B] font-semibold mt-1 leading-relaxed">
            Expected Behavior: <span className="text-[#64748B] font-medium">{failure.expected}</span>
          </p>
        </div>

        <div className="glass-card p-6 text-center flex flex-col items-center justify-center border-l-4 border-l-[#E11D8D] bg-red-50/50">
          <span className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-wider block">Severity Rating</span>
          <h3 className="text-[30px] font-black text-[#E11D8D] mt-1 leading-none">{failure.severity}</h3>
          <span className="text-[12px] text-[#64748B] mt-1 font-bold">Confidence: {Math.round(evidence.confidence * 100)}%</span>
        </div>
      </div>

      {/* Forensic Evidence details */}
      <div className="glass-card p-6 space-y-4 bg-white">
        <h3 className="text-[15px] font-black uppercase text-[#18152B] tracking-wider">Forensic Evidence Check</h3>
        
        <div className="space-y-4 text-[14px] font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#F8F7FC] p-3.5 rounded-xl border border-[#E5E7EB] space-y-1.5">
              <span className="text-[11px] uppercase font-black text-[#EF4444] block">Observed Behavior</span>
              <p className="font-mono text-[#EF4444] break-all leading-relaxed">"{failure.actual}"</p>
            </div>
            
            <div className="bg-[#F8F7FC] p-3.5 rounded-xl border border-[#E5E7EB] space-y-1.5">
              <span className="text-[11px] uppercase font-black text-[#64748B] block">Triggered Guardrail Rule</span>
              <p className="font-mono text-[#18152B] leading-relaxed">{evidence.rule_triggered}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F7FC] border border-[#E5E7EB] space-y-1.5">
            <span className="text-[11px] uppercase font-black text-[#64748B] block">Forensics Analysis Details</span>
            <p className="text-[#18152B] leading-relaxed font-medium">{evidence.reasoning_summary}</p>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="glass-card p-6 space-y-4 bg-[#FFFFFF]">
        <h3 className="text-[15px] font-black uppercase text-[#18152B] tracking-wider">Risk Assessment Mapping</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[14px] font-bold">
          <div className="p-3.5 bg-[#F8F7FC] rounded-xl border border-[#E5E7EB] space-y-0.5">
            <span className="text-[11px] uppercase font-black text-[#64748B] block mb-1">Likelihood</span>
            <span className="text-[#18152B] text-[14px] font-extrabold">{risk.likelihood}</span>
          </div>
          <div className="p-3.5 bg-[#F8F7FC] rounded-xl border border-[#E5E7EB] space-y-0.5">
            <span className="text-[11px] uppercase font-black text-[#64748B] block mb-1">Impact Severity</span>
            <span className="text-[#E11D8D] text-[14px] font-extrabold">{risk.impact}</span>
          </div>
          <div className="p-3.5 bg-[#F8F7FC] rounded-xl border border-[#E5E7EB] space-y-0.5">
            <span className="text-[11px] uppercase font-black text-[#64748B] block mb-1">Affected API Endpoint</span>
            <span className="text-[#4F46E5] text-[14px] font-mono font-bold">{risk.affected_tool}</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#F8F7FC] rounded-xl border border-[#E5E7EB] text-[14px] space-y-1.5">
          <span className="text-[11px] uppercase font-black text-[#64748B] block">Business Potential Impact</span>
          <p className="text-[#18152B] font-semibold leading-relaxed">{risk.potential_impact}</p>
        </div>
      </div>

      {/* Replay Terminal logs console */}
      {replaying || replayLogs.length > 0 ? (
        <div className="glass-card p-6 space-y-4 bg-white">
          <h3 className="text-[15px] font-black uppercase text-[#E11D8D] tracking-wider flex items-center gap-1.5">
            <Terminal className="w-4.5 h-4.5 animate-pulse" /> Replay Timeline Console
          </h3>
          
          <div className="code-console p-4.5 rounded-xl h-[200px] overflow-y-auto space-y-2.5 text-[14px] font-mono text-[#18152B] leading-relaxed">
            {replayLogs.map((log, index) => {
              let clr = "text-[#18152B]";
              if (log.includes("[TOOL_CALL]")) clr = "text-[#7C3AED] font-bold";
              if (log.includes("[ERROR]")) clr = "text-[#EF4444] font-bold";
              if (log.includes("[SUCCESS]")) clr = "text-[#10B981] font-bold";
              return (
                <div key={index} className={clr}>
                  {log}
                </div>
              );
            })}
            {replayOutcome && (
              <div className={`mt-3 font-bold border-t border-[#E5E7EB] pt-2.5 text-[13px] uppercase flex items-center gap-1.5 ${
                replayOutcome === "FAIL" ? "text-[#EF4444]" : "text-[#10B981]"
              }`}>
                Simulation Outcome: {replayOutcome === "FAIL" ? "EXPLOIT TRIGGERED" : "SAFEGUARD ALIGNED"}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* AI Recommendations */}
      <div className="glass-card p-6 space-y-4 bg-white">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <h3 className="text-[15px] font-black uppercase text-[#18152B] tracking-wider">AI Fix Recommendations</h3>
          
          <button
            onClick={handleCopyRec}
            className="h-10 px-4 text-[13px] bg-white border border-[#4F46E5] text-[#4F46E5] hover:bg-[#E0E7FF] rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all shadow-sm cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy Recommendations"}
          </button>
        </div>

        <div className="space-y-4">
          {failure.recommendations.map((rec, idx) => (
            <div key={idx} className="flex gap-3.5 items-start text-[14px] leading-relaxed">
              <div className="p-1 rounded bg-[#E0E7FF] text-[#4F46E5] mt-0.5 font-mono text-[11px] font-black w-6 h-6 flex items-center justify-center shrink-0">
                {idx + 1}
              </div>
              <div className="space-y-1">
                <span className={`px-2.5 py-0.5 rounded-lg text-[12px] font-black uppercase tracking-wider mr-2 ${
                  rec.priority === "CRITICAL" ? "bg-red-50 text-[#EF4444] border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {rec.priority} PRIORITY
                </span>
                <p className="text-[#18152B] mt-1.5 font-semibold leading-relaxed">{rec.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
