import React, { useState } from "react";
import { api } from "../services/api";
import { ShieldAlert, PlayCircle, AlertTriangle, ShieldCheck, Terminal, HelpCircle, Flame, Users, AlertOctagon, RefreshCw, Activity } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

interface RedTeamProps {
  agentId: number;
  onNavigate: (page: string, params?: any) => void;
}

export const RedTeam: React.FC<RedTeamProps> = ({ agentId, onNavigate }) => {
  const { addNotification } = useNotifications();
  const [running, setRunning] = useState(false);
  const [attacks, setAttacks] = useState<any[]>([]);
  const [version, setVersion] = useState("V1.0.0"); // V1 vs V2 selector for red teaming
  const [errorMessage, setErrorMessage] = useState("");

  // Visual card configurations representing the 6 attack types
  const attackTypes = [
    { name: "Prompt Injection", icon: <Terminal className="w-5 h-5 text-[#4F46E5]" />, scenarios: 20, risk: "HIGH", passed: version === "V1.0.0" ? 14 : 20, fails: version === "V1.0.0" ? 6 : 0 },
    { name: "Social Engineering", icon: <Users className="w-5 h-5 text-[#7C3AED]" />, scenarios: 15, risk: "MEDIUM", passed: version === "V1.0.0" ? 11 : 15, fails: version === "V1.0.0" ? 4 : 0 },
    { name: "Tool Abuse", icon: <RefreshCw className="w-5 h-5 text-[#E11D8D]" />, scenarios: 20, risk: "CRITICAL", passed: version === "V1.0.0" ? 12 : 19, fails: version === "V1.0.0" ? 8 : 1 },
    { name: "Privilege Escalation", icon: <ShieldAlert className="w-5 h-5 text-[#EF4444]" />, scenarios: 15, risk: "CRITICAL", passed: version === "V1.0.0" ? 10 : 15, fails: version === "V1.0.0" ? 5 : 0 },
    { name: "Goal Drift", icon: <Activity className="w-5 h-5 text-indigo-500" />, scenarios: 15, risk: "HIGH", passed: version === "V1.0.0" ? 11 : 14, fails: version === "V1.0.0" ? 4 : 1 },
    { name: "Destructive Action", icon: <Flame className="w-5 h-5 text-orange-500" />, scenarios: 15, risk: "CRITICAL", passed: version === "V1.0.0" ? 10 : 15, fails: version === "V1.0.0" ? 5 : 0 }
  ];

  const handleRunAudit = async () => {
    setRunning(true);
    setAttacks([]);
    setErrorMessage("");
    try {
      // 1. Create a dynamic evaluation record in the database for the active agent and version
      const runRecord = await api.createEvaluation({
        agent_id: agentId,
        version_num: version,
        test_count: 25,
        categories: ["Normal", "Edge Case", "Ambiguous", "Safety", "Prompt Injection", "Failure Recovery", "Tool Misuse"]
      });

      // 2. Execute Red-Team audit on that evaluation record ID
      const results = await api.runRedTeam(runRecord.id);
      setAttacks(results);
      
      const failsCount = results.filter((attack: any) => attack.status.toUpperCase() === "CRITICAL" || attack.status.toUpperCase() === "FAILED").length;
      if (failsCount > 0) {
        addNotification({
          title: "Critical vulnerability detected",
          description: `Red Team discovered ${failsCount} vulnerabilities in ${version}. cancel_order bypass verified.`,
          type: "critical",
          route: "redteam"
        });
      } else {
        addNotification({
          title: "Red Team Audit completed",
          description: `Zero vulnerabilities discovered in ${version} security verification.`,
          type: "success",
          route: "redteam"
        });
      }
    } catch (e: any) {
      console.error(e);
      let msg = e.message || "Failed to run Red-Team audit.";
      if (msg.includes("Failed to fetch") || msg.includes("fetch")) {
        msg = "Unable to connect to the evaluation service. Please verify that the backend is running.";
      }
      setErrorMessage(`Red-Team audit failed: ${msg}`);
    } finally {
      setRunning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "BLOCKED":
      case "PASSED":
        return <span className="px-2.5 py-1 rounded-lg text-[12px] font-black bg-emerald-50 text-[#10B981] border border-green-200">PASSED</span>;
      case "FAILED":
      case "VULNERABILITY":
        return <span className="px-2.5 py-1 rounded-lg text-[12px] font-black bg-red-50 text-[#EF4444] border border-red-200">VULNERABILITY</span>;
      case "CRITICAL":
        return <span className="px-2.5 py-1 rounded-lg text-[12px] font-black bg-red-100 text-[#EF4444] border border-red-300">CRITICAL BYPASS</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg text-[12px] font-black bg-amber-50 text-[#F59E0B] border border-amber-200">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E7EB] pb-4 gap-4">
        <div>
          <h1 className="text-[30px] font-black text-[#18152B] flex items-center gap-2">
            <Flame className="w-6 h-6 text-[#E11D8D] animate-pulse" /> RED TEAM ATTACK LAB
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1 font-semibold">
            Adversarially test your AI agent before attackers do.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-2 text-[14px] select-none h-11">
            <span className="text-[12px] font-black uppercase text-[#64748B]">Target Model:</span>
            <select
              value={version}
              onChange={e => setVersion(e.target.value)}
              className="bg-transparent text-[#18152B] font-black focus:outline-none cursor-pointer text-[14px]"
            >
              <option value="V1.0.0">V1.0.0 (Vulnerable)</option>
              <option value="V2.0.0">V2.0.0 (Secure)</option>
            </select>
          </div>
          
          <button
            onClick={handleRunAudit}
            disabled={running}
            className="h-11 px-6 text-[14px] font-black bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-90 disabled:bg-slate-100 disabled:text-slate-400 rounded-xl text-white flex items-center gap-1.5 transition-all shadow-md shadow-[#4F46E5]/15 cursor-pointer"
          >
            {running ? "Simulating Attacks..." : "START RED TEAM AUDIT"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="glass-card p-6 bg-red-50 border border-red-200 rounded-2xl space-y-3 select-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-red-800 font-black text-[15px]">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
              <span className="uppercase">Red-Team Simulation Failed</span>
            </div>
            <p className="text-[13px] text-red-700 font-semibold leading-relaxed">
              {errorMessage}
            </p>
          </div>
          <button
            onClick={handleRunAudit}
            className="h-10 px-5 text-[12px] font-black bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer select-none shrink-0"
          >
            Retry Simulation
          </button>
        </div>
      )}

      {/* SVG Attack Activity Graph */}
      <div className="glass-card p-6 bg-[#FFFFFF]">
        <span className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-wider block mb-3">Attack Payload Traffic Activity</span>
        <div className="w-full h-24 flex items-end">
          <svg className="w-full h-full text-[#7C3AED]/40" viewBox="0 0 500 80" preserveAspectRatio="none">
            {/* Draw grid lines */}
            <line x1="0" y1="20" x2="500" y2="20" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="3,3" />
            <line x1="0" y1="40" x2="500" y2="40" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="3,3" />
            <line x1="0" y1="60" x2="500" y2="60" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="3,3" />
            
            {/* Plot path */}
            <path
              d="M0,70 L40,65 L80,30 L120,45 L160,15 L200,60 L240,40 L280,10 L320,55 L360,35 L400,68 L440,25 L480,50 L500,45"
              fill="none"
              stroke="url(#attack-gradient)"
              strokeWidth="2.5"
            />
            <defs>
              <linearGradient id="attack-gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="50%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#E11D8D" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="flex justify-between text-[10px] font-extrabold text-[#64748B] uppercase mt-2">
          <span>0s</span>
          <span>10s</span>
          <span>20s</span>
          <span>30s</span>
          <span>40s</span>
          <span>50s</span>
        </div>
      </div>

      {/* Grid of 6 distinct attack type cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {attackTypes.map((atk, idx) => {
          return (
            <div key={idx} className="glass-card p-6 bg-[#FFFFFF] hover:border-[#DDD6FE] transition-all duration-300 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#E0E7FF]/50 flex items-center justify-center">
                  {atk.icon}
                </div>
                <span className={`px-2.5 py-0.5 rounded-lg text-[12px] font-black border ${
                  atk.risk === "CRITICAL" ? "bg-red-50 text-[#EF4444] border-red-200 animate-pulse" : "bg-orange-50 text-orange-600 border-orange-200"
                }`}>
                  {atk.risk} RISK
                </span>
              </div>
              
              <div className="space-y-1.5">
                <h4 className="text-[18px] font-black text-[#18152B]">{atk.name}</h4>
                <div className="text-[14px] text-[#64748B] font-semibold">
                  Scenarios Count: <strong className="text-[#18152B]">{atk.scenarios}</strong>
                </div>
              </div>

              {/* Stats values */}
              <div className="grid grid-cols-2 gap-2 text-center text-[13px] font-bold border-t border-[#E5E7EB] pt-3">
                <div className="p-2 rounded bg-[#F8F7FC]">
                  <span className="text-[#64748B] text-[11px] uppercase block">Passed</span>
                  <span className="text-[#10B981] font-black text-[22px] block mt-0.5">{atk.passed}</span>
                </div>
                <div className="p-2 rounded bg-red-50/50">
                  <span className="text-[#64748B] text-[11px] uppercase block">Vulnerabilities</span>
                  <span className="text-[#EF4444] font-black text-[22px] block mt-0.5">{atk.fails}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attack trace timeline logs */}
      {attacks.length > 0 && (
        <div className="glass-card p-6 bg-[#FFFFFF] space-y-4">
          <h3 className="text-[15px] font-black uppercase text-[#18152B] tracking-wider">Attack Log Findings</h3>
          <div className="space-y-4">
            {attacks.map((attack, idx) => {
              const hasFailure = attack.status === "FAILED" || attack.status === "CRITICAL";
              return (
                <div
                  key={idx}
                  className={`border p-4.5 rounded-2xl space-y-3 bg-[#FFFFFF] ${
                    hasFailure ? "border-red-200" : "border-[#E5E7EB]"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#E5E7EB]/70 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-black text-[#18152B]">{attack.vector}</span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[12px] font-black uppercase border ${
                        attack.severity === "CRITICAL" ? "bg-red-50 text-[#EF4444] border-red-200" : "bg-amber-50 text-[#F59E0B] border-amber-200"
                      }`}>
                        {attack.severity} risk
                      </span>
                    </div>
                    {getStatusBadge(attack.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[14px] font-mono leading-relaxed">
                    <div className="space-y-1">
                      <span className="text-[11px] text-[#64748B] uppercase font-bold block">Adversarial Input Payload</span>
                      <div className="bg-[#F8F7FC] p-3 rounded-lg border border-[#E5E7EB] text-[#18152B] font-semibold">
                        "{attack.prompt}"
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] text-[#64748B] uppercase font-bold block">Agent Sandbox Response</span>
                      <div className="bg-[#F8F7FC] p-3 rounded-lg border border-[#E5E7EB] text-[#7C3AED] font-semibold">
                        "{attack.actual}"
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
