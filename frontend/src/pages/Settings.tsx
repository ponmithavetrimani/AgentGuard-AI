import React from "react";
import { Settings, ShieldCheck, Database, HardDrive, RefreshCw } from "lucide-react";

export const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="border-b border-[#E5E7EB] pb-4">
        <h1 className="text-[30px] font-black text-[#18152B] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#4F46E5]" /> Platform Config & Settings
        </h1>
        <p className="text-[14px] text-[#64748B] mt-1 font-semibold">
          Modify evaluation parameters, LLM providers, and sandbox connections.
        </p>
      </div>

      <div className="glass-card p-6 space-y-4 bg-[#FFFFFF]">
        <h3 className="text-[15px] font-black uppercase text-[#18152B] tracking-wider">Engine Properties</h3>
        <div className="space-y-4 text-[14px] font-bold">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
            <span className="text-[#64748B]">Auditing Context Mode</span>
            <span className="text-emerald-600 uppercase font-black">LOCAL DEMO SANDBOX</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
            <span className="text-[#64748B]">Mock Database Store</span>
            <span className="text-[#18152B] font-mono font-bold flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#4F46E5]" /> SQLite (agentguard.db)
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
            <span className="text-[#64748B]">LLM API Gateway</span>
            <span className="text-[#7C3AED]">Deterministic Exploit Permutation Fallback</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Sandbox Reset</span>
            <button
              onClick={() => alert("Mock database store reset successfully to default Customer/Order seeds.")}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#4F46E5] hover:bg-[#E0E7FF] text-[#4F46E5] font-bold transition-all text-[12px] flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Databases
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
