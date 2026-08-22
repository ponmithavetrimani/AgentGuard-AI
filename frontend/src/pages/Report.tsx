import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { ArrowLeft, Printer, Shield, CheckCircle, XCircle } from "lucide-react";

interface ReportProps {
  evaluationId: number;
  onNavigate: (page: string, params?: any) => void;
}

export const Report: React.FC<ReportProps> = ({ evaluationId, onNavigate }) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await api.generateReport(evaluationId);
        setReport(res.summary);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [evaluationId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
        <span className="text-[15px] text-[#64748B] font-bold">Compiling assessment report data...</span>
      </div>
    );
  }

  if (!report) return <div>Failed to load report data.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header controls (will be hidden during print) */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 print:hidden">
        <button
          onClick={() => onNavigate("results", { evaluationId })}
          className="text-[14px] text-[#4F46E5] hover:underline flex items-center gap-1.5 font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4.5 h-4.5" /> Back to Results
        </button>
        
        <button
          onClick={handlePrint}
          className="h-11 px-5 text-[14px] font-bold bg-[#4F46E5] hover:opacity-90 rounded-xl text-white flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
        >
          <Printer className="w-4 h-4" /> EXPORT REPORT (PDF)
        </button>
      </div>

      {/* Printable Report Layout */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-3xl p-8 space-y-8 text-[#18152B] print:bg-white print:text-black print:border-none print:p-0 shadow-md">
        
        {/* Title Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-6 print:border-black">
          <div className="space-y-1.5">
            <h1 className="text-[30px] font-black tracking-tight text-[#18152B] flex items-center gap-2">
              <Shield className="w-7 h-7 text-[#4F46E5]" /> AGENTGUARD AI
            </h1>
            <p className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-widest">
              Agent Reliability & Security Report
            </p>
          </div>
          <div className="text-right text-[14px] font-bold">
            <div className="text-[#64748B] uppercase text-[11px] font-black">Document ID</div>
            <div className="font-mono text-[#18152B] font-black text-[14px]">AG-AUD-{evaluationId}</div>
            <div className="text-[11px] text-[#64748B] font-semibold mt-1">{new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3.5 md:col-span-2 text-[14px] font-semibold leading-relaxed">
            <h3 className="text-[15px] font-black uppercase text-[#4F46E5] tracking-wider">Executive Summary</h3>
            <p className="text-[14px] text-[#18152B] leading-relaxed">
              This security assessment certifies the audit profile of the E-Commerce Customer Support AI Agent, version {report.version}. 
              The target model underwent {report.total_tests} evaluations including prompt injection vectors, 
              identity verification bypass overrides, and financial payment tool loop stress tests in an isolated sandbox database.
            </p>
          </div>

          <div className="border border-[#E5E7EB] rounded-2xl p-6 text-center flex flex-col items-center justify-center bg-[#F8F7FC] print:bg-slate-50 gap-1.5">
            <span className="text-[11px] uppercase font-extrabold text-[#64748B] block">Reliability Score</span>
            <h2 className="text-[32px] font-black text-[#18152B] mt-1 leading-none">{report.scores.reliability}%</h2>
            <span className="text-[12px] text-[#10B981] mt-1.5 uppercase font-black tracking-widest block leading-none">
              {report.production_readiness}
            </span>
          </div>
        </div>

        {/* Security Findings & Metrics */}
        <div className="space-y-4">
          <h3 className="text-[15px] font-black uppercase text-[#4F46E5] tracking-wider border-b border-[#E5E7EB] pb-2 print:border-black">
            Vulnerability Metrics Breakdown
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-[#F8F7FC] rounded-2xl border border-[#E5E7EB] space-y-1">
              <span className="text-[11px] text-[#64748B] uppercase font-bold">Safety Constraints</span>
              <div className="text-[20px] font-black text-[#18152B] mt-1">
                {report.scores.safety_score || report.scores.safety}%
              </div>
            </div>
            <div className="p-4 bg-[#F8F7FC] rounded-2xl border border-[#E5E7EB] space-y-1">
              <span className="text-[11px] text-[#64748B] uppercase font-bold">Tool Call limits</span>
              <div className="text-[20px] font-black text-[#18152B] mt-1">
                {report.scores.tool_usage_score || report.scores.tool_usage}%
              </div>
            </div>
            <div className="p-4 bg-[#F8F7FC] rounded-2xl border border-[#E5E7EB] space-y-1">
              <span className="text-[11px] text-[#64748B] uppercase font-bold">Goal Focus</span>
              <div className="text-[20px] font-black text-[#18152B] mt-1">
                {report.scores.goal_adherence_score || report.scores.goal_adherence}%
              </div>
            </div>
            <div className="p-4 bg-[#F8F7FC] rounded-2xl border border-[#E5E7EB] space-y-1">
              <span className="text-[11px] text-[#64748B] uppercase font-bold">Prompt Injection Res.</span>
              <div className="text-[20px] font-black text-[#18152B] mt-1">
                {report.scores.prompt_injection_resistance || report.scores.injection}%
              </div>
            </div>
          </div>
        </div>

        {/* Red team results stats */}
        <div className="space-y-4">
          <h3 className="text-[15px] font-black uppercase text-[#4F46E5] tracking-wider border-b border-[#E5E7EB] pb-2 print:border-black">
            Red Team Results & Scenarios
          </h3>
          
          <div className="grid grid-cols-3 gap-4 text-center text-[14px] font-bold">
            <div className="p-3 border border-[#E5E7EB] space-y-0.5">
              <span className="text-[#64748B] block uppercase text-[11px] font-black">Total Scenarios</span>
              <span className="text-[20px] font-black text-[#18152B]">{report.total_tests}</span>
            </div>
            <div className="p-3 border border-[#E5E7EB] text-[#10B981] space-y-0.5">
              <span className="text-[#64748B] block uppercase text-[11px] font-black">Passed</span>
              <span className="text-[20px] font-black">{report.passed}</span>
            </div>
            <div className="p-3 border border-[#E5E7EB] text-[#EF4444] space-y-0.5">
              <span className="text-[#64748B] block uppercase text-[11px] font-black">Failed</span>
              <span className="text-[20px] font-black">{report.failed}</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <h3 className="text-[15px] font-black uppercase text-[#4F46E5] tracking-wider border-b border-[#E5E7EB] pb-2 print:border-black">
            Recommendations
          </h3>
          <div className="space-y-3.5 text-[14px] text-[#18152B] font-semibold leading-relaxed">
            {report.recommendations.map((rec: string, index: number) => (
              <div key={index} className="flex gap-2.5 items-start">
                <span className="font-bold text-[#4F46E5] text-[15px]">{index + 1}.</span>
                <p>{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E5E7EB] print:border-black pt-6 text-[12px] text-[#64748B] flex justify-between font-bold">
          <span>Platform Verification powered by AgentGuard AI</span>
          <span>Signature Verification: __________________________</span>
        </div>
      </div>
    </div>
  );
};
