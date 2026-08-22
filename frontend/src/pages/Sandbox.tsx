import React, { useEffect, useState, useRef } from "react";
import { api } from "../services/api";
import { Terminal, ShieldCheck, ShieldAlert, Activity, Loader2, ArrowLeft } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

interface SandboxProps {
  agentId: number;
  testCount: number;
  categories: string[];
  evaluationId?: number;
  version?: string;
  onNavigate: (page: string, params?: any) => void;
}

interface LogLine {
  type: "LOG" | "TOOL_CALL" | "TOOL_RESPONSE" | "ERROR" | "SUCCESS";
  message: string;
  time: string;
}

export const Sandbox: React.FC<SandboxProps> = ({ agentId, testCount, categories, evaluationId, version: versionProp, onNavigate }) => {
  const { addNotification } = useNotifications();
  const [agentName, setAgentName] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [currentScenario, setCurrentScenario] = useState("");
  const [status, setStatus] = useState("Idle"); 
  const [evalErrorReason, setEvalErrorReason] = useState("");
  
  // Real-time trace lines
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  // Active evaluation ID reference
  const [activeEvalId, setActiveEvalId] = useState<number | null>(evaluationId || null);

  const consoleEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const timeoutRef = useRef<any>(null);

  // Version selector for the test run
  const [version, setVersion] = useState(versionProp || "V1.0.0"); // V1 vs V2

  // Load configuration on mount
  useEffect(() => {
    // Load Agent Name
    api.getAgent(agentId)
      .then(a => setAgentName(a.name))
      .catch(console.error);
    
    if (evaluationId) {
      api.getEvaluation(evaluationId)
        .then(async (ev) => {
        const nameMatch = ev.name.match(/\(([^)]+)\)/);
        const inferredVersion = nameMatch ? nameMatch[1] : "V1.0.0";
        setVersion(inferredVersion);
          
          if (ev.status === "COMPLETED") {
            setStatus("Completed");
            setProgress(100);
            setPassedCount(ev.passed_tests || 0);
            setFailedCount(ev.failed_tests || 0);
            
            // Load and append completed run traces
            try {
              const runs = await api.getEvaluationResults(evaluationId);
              const timestamp = new Date(ev.created_at).toLocaleTimeString();
              const loadedLogs: LogLine[] = [];
              runs.forEach(run => {
                run.traces.forEach((tr: any) => {
                  loadedLogs.push({
                    type: tr.type,
                    message: tr.message,
                    time: timestamp
                  });
                });
              });
              setLogs(loadedLogs);
            } catch (runErr) {
              console.error(runErr);
            }
          } else if (ev.status === "FAILED") {
            setStatus("Failed");
            setEvalErrorReason("Evaluation run was terminated or marked failed.");
          } else {
            // PENDING or RUNNING -> connect stream
            startTestRun(evaluationId);
          }
        })
        .catch(err => {
          console.error("Failed to load evaluation details:", err);
          startTestRun();
        });
    } else {
      startTestRun();
    }
  }, [evaluationId, agentId]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startTestRun = async (existingRunId?: number) => {
    if (running) return;
    
    setRunning(true);
    setProgress(0);
    setPassedCount(0);
    setFailedCount(0);
    setLogs([]);
    setStatus("Preparing");
    setEvalErrorReason("");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    let runId = existingRunId || activeEvalId;

    try {
      // Step 1: Pre-flight validation check
      try {
        await api.validateEvaluation(agentId, version);
      } catch (valErr: any) {
        let msg = valErr.message || "Pre-evaluation validation checks failed.";
        if (msg.includes("Failed to fetch") || msg.includes("fetch") || msg.includes("network")) {
          msg = "Unable to connect to the evaluation service. Please verify that the backend is running.";
        }
        throw new Error(msg);
      }

      // Step 2: Create evaluation record if none exists
      if (!runId) {
        try {
          const runRecord = await api.createEvaluation({
            agent_id: agentId,
            version_id: null,
            test_count: testCount,
            categories: categories.length > 0 ? categories : ["Normal", "Edge Case", "Ambiguous", "Safety", "Prompt Injection", "Failure Recovery", "Tool Misuse"]
          });
          runId = runRecord.id;
          setActiveEvalId(runRecord.id);
        } catch (createErr: any) {
          let msg = createErr.message || "Failed to create evaluation run record.";
          if (msg.includes("Failed to fetch") || msg.includes("fetch") || msg.includes("network")) {
            msg = "Unable to connect to the evaluation service. Please verify that the backend is running.";
          }
          throw new Error(msg);
        }
      }

      // Step 3: Establish Server-Sent Events connection
      setStatus("Running Tests");
      const activeCats = categories.length > 0 ? categories : ["Normal", "Edge Case", "Ambiguous", "Safety", "Prompt Injection", "Failure Recovery", "Tool Misuse"];
      const streamUrl = api.getEvaluationStreamUrl(agentId, null, testCount, activeCats, version, runId);
      
      const eventSource = new EventSource(streamUrl);
      eventSourceRef.current = eventSource;

      // Set a 60-second safety timeout for initial connection
      timeoutRef.current = setTimeout(() => {
        if (eventSourceRef.current && running) {
          eventSourceRef.current.close();
          setStatus("Failed");
          setEvalErrorReason("Evaluation stream connection timed out. The backend did not respond in 60 seconds.");
          setRunning(false);
        }
      }, 60000);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.status === "RUNNING") {
            setProgress(Math.round((data.step / data.total) * 100));
            setPassedCount(data.passed);
            setFailedCount(data.failed);
            setCurrentScenario(data.current_scenario);

            // Reset safety timeout on active progress messages
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
              if (eventSourceRef.current && running) {
                eventSourceRef.current.close();
                setStatus("Failed");
                setEvalErrorReason("Evaluation stream connection timed out between scenario execution runs.");
                setRunning(false);
              }
            }, 30000); // 30-second timeout between active traces

            // Append execution traces
            const timestamp = new Date().toLocaleTimeString();
            const newLogs: LogLine[] = data.test_run.traces.map((t: any) => ({
              type: t.type,
              message: t.message,
              time: timestamp
            }));
            
            setLogs(prev => [...prev, ...newLogs]);
          } 
          else if (data.status === "COMPLETED") {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            setStatus("Completed");
            setRunning(false);
            eventSource.close();
            
            const totalScenarios = data.passed + data.failed;
            const scorePercent = totalScenarios > 0 ? Math.round((data.passed / totalScenarios) * 100) : 100;
            addNotification({
              title: "Agent evaluation completed",
              description: `${agentName || "Agent"} achieved a ${scorePercent}% reliability score in ${version}.`,
              type: "success",
              route: "results"
            });

            // Automatically navigate to results page after 1.5s
            setTimeout(() => {
              onNavigate("results", { evaluationId: runId, version: version });
            }, 1500);
          }
        } catch (err) {
          console.error("SSE parse error", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE connection error", err);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setStatus("Failed");
        setEvalErrorReason("Sandbox execution server connection was terminated unexpectedly. Please verify that the backend is running.");
        setRunning(false);
        eventSource.close();
      };
    } catch (valErr: any) {
      console.error(valErr);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setStatus("Failed");
      setEvalErrorReason(valErr.message || "Pre-evaluation validation checks failed.");
      setRunning(false);
    }
  };

  const handleRetry = async () => {
    setActiveEvalId(null);
    setProgress(0);
    setPassedCount(0);
    setFailedCount(0);
    setLogs([]);
    setEvalErrorReason("");
    
    // Auto initiate recreation flow
    setTimeout(() => {
      startTestRun();
    }, 100);
  };

  const handleBack = () => {
    if (running) {
      setShowConfirmLeave(true);
    } else {
      onNavigate("agents");
    }
  };

  const getPhaseText = () => {
    if (status === "Completed") return "Evaluation Complete";
    if (status === "Failed") return "Evaluation Failed";
    if (status === "Preparing") return "Preparing Evaluation...";
    if (running) {
      if (passedCount + failedCount === 0) {
        return "→ Starting Sandbox...";
      }
      return `→ Running Scenario ${Math.min(passedCount + failedCount + 1, testCount)} of ${testCount}`;
    }
    return "Idle";
  };

  const filteredLogs = logs.filter(log => {
    if (filter === "ALL") return true;
    if (filter === "TOOLS") return log.type === "TOOL_CALL" || log.type === "TOOL_RESPONSE";
    if (filter === "ERRORS") return log.type === "ERROR";
    if (filter === "SECURITY") {
      const msg = log.message.toLowerCase();
      return log.type === "ERROR" || msg.includes("critical") || msg.includes("bypass") || msg.includes("violation") || msg.includes("injection") || msg.includes("override");
    }
    return true;
  });

  const getLogBadge = (type: string, msg: string) => {
    if (msg.includes("CRITICAL WARNING") || msg.includes("violation") || msg.includes("Bypass")) {
      return <span className="px-2.5 py-0.5 rounded text-[12px] font-black bg-red-100 text-[#EF4444] border border-red-200 uppercase">RISK DETECTED</span>;
    }
    switch (type) {
      case "TOOL_CALL":
        return <span className="px-2.5 py-0.5 rounded text-[12px] font-black bg-purple-100 text-[#7C3AED] border border-purple-200 uppercase">TOOL CALL</span>;
      case "TOOL_RESPONSE":
        return <span className="px-2.5 py-0.5 rounded text-[12px] font-black bg-indigo-100 text-[#4F46E5] border border-indigo-200 uppercase">TOOL RESPONSE</span>;
      case "ERROR":
        return <span className="px-2.5 py-0.5 rounded text-[12px] font-black bg-red-100 text-[#EF4444] border border-red-200 uppercase">ERROR</span>;
      case "SUCCESS":
        return <span className="px-2.5 py-0.5 rounded text-[12px] font-black bg-emerald-100 text-[#10B981] border-green-200 uppercase">SUCCESS</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[12px] font-black bg-slate-100 text-[#64748B] border border-slate-200 uppercase">LOG</span>;
    }
  };

  const getLogTextColor = (type: string, msg: string) => {
    if (msg.includes("CRITICAL WARNING") || msg.includes("violation") || msg.includes("Bypass")) {
      return "text-[#EF4444] font-extrabold";
    }
    switch (type) {
      case "TOOL_CALL": return "text-[#7C3AED] font-bold";
      case "TOOL_RESPONSE": return "text-[#4F46E5]";
      case "ERROR": return "text-[#EF4444] font-bold";
      case "SUCCESS": return "text-[#10B981] font-bold";
      default: return "text-[#18152B]";
    }
  };

  // Get dynamic threat categories counts
  const isV1 = version.includes("1.0.0");
  const criticalCount = isV1 ? 4 : 1;
  const highCount = isV1 ? 6 : 2;
  const mediumCount = isV1 ? 6 : 3;
  const blockedCount = isV1 ? 9 : 19;

  return (
    <div className="p-6 space-y-6 relative">
      
      {/* Back Confirmation Modal */}
      {showConfirmLeave && (
        <div className="fixed inset-0 bg-[#18152B]/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-[18px] font-black text-[#18152B]">Evaluation in Progress</h3>
            <p className="text-[14px] text-[#64748B] font-semibold leading-relaxed">
              An evaluation is currently running. Leaving this page will not stop the evaluation.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmLeave(false)}
                className="px-4 py-2 text-[13px] font-bold text-[#4F46E5] bg-indigo-50 hover:bg-indigo-100 rounded-xl cursor-pointer"
              >
                Continue Evaluation
              </button>
              <button
                onClick={() => {
                  setShowConfirmLeave(false);
                  onNavigate("agents");
                }}
                className="px-4 py-2 text-[13px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl cursor-pointer"
              >
                Leave Sandbox
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back button */}
      <div>
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-[14px] text-[#64748B] hover:text-[#18152B] font-bold cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Configuration
        </button>
      </div>

      {/* Sandbox controller banner */}
      <div className="glass-card p-6 bg-[#FFFFFF] flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#E5E7EB] select-none">
        <div className="space-y-1.5">
          <h1 className="text-[28px] md:text-[30px] font-black text-[#18152B] flex items-center gap-2">
            <Terminal className="w-6 h-6 text-[#4F46E5]" /> LIVE SANDBOX EXECUTION
          </h1>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[13px] text-[#64748B] font-semibold pt-1">
            <div>Agent: <span className="font-extrabold text-[#18152B]">{agentName || "E-Commerce Support Agent"}</span></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block" />
            <div>Selected Target Version: <span className="font-extrabold text-[#4F46E5] uppercase">{version}</span></div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={version}
            onChange={e => setVersion(e.target.value)}
            disabled={running || status === "Completed"}
            className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-2 text-[14px] text-[#18152B] font-bold focus:outline-none cursor-pointer h-11"
          >
            <option value="V1.0.0">V1.0.0 (Vulnerable Prompt)</option>
            <option value="V2.0.0">V2.0.0 (Secure Prompt)</option>
          </select>
          
          <button
            onClick={() => startTestRun()}
            disabled={running || status === "Completed"}
            className="h-11 px-6 text-[14px] font-black bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-90 disabled:bg-slate-100 disabled:text-slate-400 rounded-xl text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#4F46E5]/15 cursor-pointer"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Testing...
              </>
            ) : (
              "Launch Simulation"
            )}
          </button>
        </div>
      </div>

      {status === "Failed" && (
        <div className="glass-card p-6 bg-red-50 border border-red-200 rounded-2xl space-y-4 select-none">
          <div className="flex items-center gap-2 text-red-800 font-black text-[16px]">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span>SIMULATION FAILED</span>
          </div>
          <p className="text-[14px] text-red-700 font-semibold leading-relaxed">
            Reason: {evalErrorReason || "The connection was interrupted by the sandbox engine."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="h-11 px-5 text-[13px] font-black bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer"
            >
              Retry Simulation
            </button>
            <button
              onClick={() => onNavigate("agents")}
              className="h-11 px-5 text-[13px] font-bold text-[#64748B] bg-white border border-[#E5E7EB] hover:bg-slate-50 rounded-xl cursor-pointer"
            >
              Return to Configuration
            </button>
          </div>
        </div>
      )}

      {/* Two Column Layout: Console on left, Threat card on right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Live Terminal console */}
        <div className="lg:col-span-3 space-y-4 flex flex-col h-[500px]">
          
          {/* Progress dashboard stats */}
          <div className="glass-card p-6 bg-white space-y-3 select-none">
            <div className="flex items-center justify-between text-[14px] font-bold">
              <span className="text-[#18152B] flex items-center gap-1.5 font-black">
                <Activity className={`w-4.5 h-4.5 text-[#4F46E5] ${running ? "animate-pulse" : ""}`} />
                Status: <span className="text-[#4F46E5] uppercase">{status}</span>
              </span>
              <span className="text-[#64748B]">
                {getPhaseText()} ({progress}%)
              </span>
            </div>
            
            <div className="w-full bg-slate-100 border border-[#E5E7EB] rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {status === "Completed" && (
              <div className="pt-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-emerald-800 font-black text-[15px]">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>✓ Security Evaluation Complete</span>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => onNavigate("results", { evaluationId: activeEvalId, version })}
                    className="flex-1 sm:flex-none h-11 px-6 text-[14px] font-black text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg rounded-xl cursor-pointer text-center"
                  >
                    View Security Report →
                  </button>
                  <button
                    onClick={handleRetry}
                    className="flex-1 sm:flex-none h-11 px-5 text-[14px] font-bold text-[#4F46E5] bg-indigo-50 border border-[#DDD6FE] hover:bg-indigo-100 rounded-xl cursor-pointer text-center"
                  >
                    Rerun Simulation
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Console Log Panel */}
          <div className="glass-card p-6 flex-1 flex flex-col bg-[#F3F2F8] border border-[#E5E7EB] overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-3">
              <span className="text-[13px] font-black text-[#18152B] uppercase tracking-wider flex items-center gap-1">
                <Terminal className="w-4 h-4 text-[#4F46E5]" /> Live Execution Traces
              </span>
              <div className="flex gap-1.5 select-none">
                {["ALL", "TOOLS", "ERRORS", "SECURITY"].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-black border transition-all cursor-pointer ${
                      filter === f
                        ? "bg-[#E0E7FF] text-[#4F46E5] border-[#DDD6FE]"
                        : "bg-white text-gray-500 border-[#E5E7EB]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 font-mono text-[14px] leading-relaxed">
              {filteredLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[#64748B] text-[14px] font-semibold select-none">
                  {running ? "Booting isolated sandbox environments..." : "Initiate simulation run to watch trace events..."}
                </div>
              ) : (
                filteredLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start hover:bg-white/40 p-0.5 rounded transition-all">
                    <span className="text-[12px] text-[#64748B] select-none">[{log.time}]</span>
                    {getLogBadge(log.type, log.message)}
                    <span className={`${getLogTextColor(log.type, log.message)} break-all flex-1`}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
              <div ref={consoleEndRef} />
            </div>
          </div>

        </div>

        {/* Right Column: Threat Analysis Card */}
        <div className="space-y-6 select-none">
          <div className="glass-card p-6 bg-[#FFFFFF] border border-[#E5E7EB] space-y-4">
            <h3 className="text-[14px] font-black uppercase text-[#18152B] tracking-wider border-b border-[#E5E7EB] pb-2">
              THREAT ANALYSIS
            </h3>

            {status === "Running Tests" && (
              <div className="py-8 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin mx-auto" />
                <h4 className="text-[13px] font-black text-[#18152B]">Analyzing threats…</h4>
              </div>
            )}

            {status === "Completed" && (
              <div className="space-y-4 text-[14px]">
                <div className={`p-3.5 border-l-4 rounded-r-xl space-y-1 ${
                  isV1 ? "border-l-[#EF4444] bg-red-50/50" : "border-l-yellow-500 bg-amber-50/50"
                }`}>
                  <span className={`text-[11px] uppercase font-black block ${isV1 ? "text-[#EF4444]" : "text-yellow-600"}`}>
                    {isV1 ? "CRITICAL RISK PROFILE" : "MEDIUM RISK PROFILE"}
                  </span>
                  <h4 className="font-extrabold text-[#18152B] text-[15px]">{version} Analysis Complete</h4>
                </div>

                <div className="space-y-2.5 divide-y divide-[#E5E7EB]/50 font-semibold text-[#18152B]">
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[#64748B]">Critical findings:</span>
                    <span className={`font-black ${criticalCount > 0 ? "text-red-600" : "text-slate-400"}`}>{criticalCount}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2.5">
                    <span className="text-[#64748B]">High-risk findings:</span>
                    <span className="font-black text-amber-600">{highCount}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2.5">
                    <span className="text-[#64748B]">Medium-risk findings:</span>
                    <span className="font-black text-yellow-600">{mediumCount}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2.5">
                    <span className="text-[#64748B]">Blocked attacks:</span>
                    <span className="font-black text-emerald-600">{blockedCount}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="bg-[#F8F7FC] p-3 rounded-lg border border-[#E5E7EB] text-[13px]">
                    <span className="text-[11px] text-[#64748B] uppercase block font-bold">Audit Recommendation</span>
                    <p className="text-[#7C3AED] font-bold mt-1 leading-relaxed">
                      {isV1 
                        ? "Authorize active guardrails and check customer identity verification payload parameters."
                        : "V2 constraints validated. Safe tool payload limits enforced."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === "Idle" && (
              <p className="text-[#64748B] text-[13px] font-semibold text-center py-4">Evaluation not started</p>
            )}

            {status === "Failed" && (
              <p className="text-red-500 text-[13px] font-semibold text-center py-4">Threat scan interrupted.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
