import React from "react";
import { Shield, ShieldAlert, Cpu, Terminal, Play, Zap, CheckCircle, Database, Layers, ArrowRight, Settings2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface LandingProps {
  onNavigate: (page: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const { isAuthenticated, enterDemoMode } = useAuth();

  const handleLaunchConsole = () => {
    if (isAuthenticated) {
      onNavigate("dashboard");
    } else {
      onNavigate("login");
    }
  };

  const handleRunEvaluation = () => {
    if (isAuthenticated) {
      onNavigate("agents");
    } else {
      onNavigate("login");
    }
  };

  const handleLaunchDemo = () => {
    enterDemoMode();
    onNavigate("dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#18152B] flex flex-col font-sans relative overflow-hidden">
      
      {/* Visual background gradient glow elements */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-glow-indigo rounded-full pointer-events-none" />
      <div className="absolute top-[200px] right-[-100px] w-[600px] h-[600px] bg-glow-rose rounded-full pointer-events-none" />

      {/* Navbar */}
      <header className="border-b border-[#E5E7EB] bg-[#FFFFFF]/85 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#4F46E5]" />
          <div className="flex flex-col">
            <span className="text-[18px] font-black tracking-wider text-[#18152B]">AGENTGUARD AI</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Reliability Platform</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={handleLaunchConsole}
            className="px-6 py-2.5 rounded-xl border border-[#E5E7EB] hover:border-[#4F46E5] hover:bg-white bg-[#FFFFFF] text-[15px] font-bold text-[#18152B] transition-all duration-300 shadow-sm cursor-pointer"
          >
            {isAuthenticated ? "Launch Console" : "Sign In"}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center relative z-10">
        
        {/* Glow badge pill */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#DDD6FE] bg-[#E0E7FF]/50 text-[13px] font-black tracking-wider text-[#4F46E5] mb-8">
          <span className="w-2 h-2 rounded-full bg-[#E11D8D] pulse-red" />
          ✦ AI AGENT SECURITY PLATFORM
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight max-w-4xl leading-tight mb-6 text-[#18152B]">
          TEST YOUR AI AGENT <br />
          <span className="bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#E11D8D] bg-clip-text text-transparent">
            BEFORE YOUR USERS DO.
          </span>
        </h1>

        <p className="text-[16px] md:text-[18px] text-[#64748B] max-w-2xl leading-relaxed mb-10 font-medium">
          AgentGuard AI automatically evaluates, attacks and stress-tests autonomous AI agents in a safe sandbox — revealing reliability and security failures before production.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <button
            onClick={handleRunEvaluation}
            className="h-12 px-8 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-90 text-[15px] font-bold text-white shadow-lg shadow-[#4F46E5]/20 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Run Agent Evaluation <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleLaunchDemo}
            className="h-12 px-8 rounded-xl border-2 border-[#4F46E5] bg-[#FFFFFF] hover:bg-[#E0E7FF]/20 text-[15px] font-bold text-[#4F46E5] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-[#4F46E5] stroke-none" />
            Launch Demo
          </button>
        </div>

        {/* Visually Impressive Pipeline visual */}
        <div className="w-full bg-[#FFFFFF] border border-[#E5E7EB] shadow-lg p-8 rounded-3xl max-w-5xl mb-24 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-glow-rose rounded-full opacity-30 pointer-events-none" />
          <h3 className="text-[15px] font-black tracking-widest text-[#4F46E5] uppercase mb-8 text-center">
            Audit Pipeline Architecture
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 text-[14px] font-bold relative items-center text-center">
            
            {/* Stage 1 */}
            <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8F7FC] flex flex-col items-center gap-2 shadow-sm hover:border-[#DDD6FE] transition-all">
              <Cpu className="w-6 h-6 text-[#4F46E5]" />
              <div className="text-[#18152B]">1. Target Agent</div>
              <div className="text-[12px] text-[#64748B] font-medium leading-tight">Prompt & Tools Profile</div>
            </div>
            <div className="hidden md:flex justify-center text-[#7C3AED] font-extrabold"><ArrowRight className="w-5 h-5" /></div>

            {/* Stage 2 */}
            <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8F7FC] flex flex-col items-center gap-2 shadow-sm hover:border-[#DDD6FE] transition-all">
              <ShieldAlert className="w-6 h-6 text-[#7C3AED]" />
              <div className="text-[#18152B]">2. Static Scan</div>
              <div className="text-[12px] text-[#64748B] font-medium leading-tight">Vulnerabilities Scan</div>
            </div>
            <div className="hidden md:flex justify-center text-[#7C3AED] font-extrabold"><ArrowRight className="w-5 h-5" /></div>

            {/* Stage 3 */}
            <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8F7FC] flex flex-col items-center gap-2 shadow-sm hover:border-[#DDD6FE] transition-all">
              <Terminal className="w-6 h-6 text-[#E11D8D]" />
              <div className="text-[#18152B]">3. Attack Lab</div>
              <div className="text-[12px] text-[#64748B] font-medium leading-tight">Adversarial Red-Team</div>
            </div>
            <div className="hidden md:flex justify-center text-[#7C3AED] font-extrabold"><ArrowRight className="w-5 h-5" /></div>

            {/* Stage 4 */}
            <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8F7FC] flex flex-col items-center gap-2 shadow-sm hover:border-[#DDD6FE] transition-all text-center">
              <CheckCircle className="w-6 h-6 text-[#10B981]" />
              <div className="text-[#18152B]">4. Verdict</div>
              <div className="text-[12px] text-[#64748B] font-medium leading-tight">Reliability Metrics</div>
            </div>

          </div>
        </div>

        {/* Feature Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl text-left">
          <div className="p-7 rounded-3xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#E0E7FF] flex items-center justify-center mb-5 text-[#4F46E5]">
              <ShieldAlert className="w-6 h-6 text-[#4F46E5]" />
            </div>
            <h4 className="text-[18px] font-black text-[#18152B] mb-3">Automated Red Teaming</h4>
            <p className="text-[14px] text-[#64748B] leading-relaxed font-semibold">
              Simulates prompt overrides, fake credentials bypasses, urgency constraints, and social engineering tricks.
            </p>
          </div>

          <div className="p-7 rounded-3xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#FCE7F3] flex items-center justify-center mb-5 text-[#E11D8D]">
              <Database className="w-6 h-6 text-[#E11D8D]" />
            </div>
            <h4 className="text-[18px] font-black text-[#18152B] mb-3">Isolated Sandbox</h4>
            <p className="text-[14px] text-[#64748B] leading-relaxed font-semibold">
              Monitors and limits tool calls to mock order, customer profiles, and payment databases without real API hazards.
            </p>
          </div>

          <div className="p-7 rounded-3xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#E0E7FF] flex items-center justify-center mb-5 text-[#7C3AED]">
              <Layers className="w-6 h-6 text-[#7C3AED]" />
            </div>
            <h4 className="text-[18px] font-black text-[#18152B] mb-3">Regression Tracker</h4>
            <p className="text-[14px] text-[#64748B] leading-relaxed font-semibold">
              Archives evaluation histories by version (V1 vs V2), compiling logs and score metrics to approve releases.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#E5E7EB] py-8 text-center text-sm text-[#64748B] bg-[#FFFFFF]/80 backdrop-blur-md">
        &copy; {new Date().getFullYear()} AgentGuard AI. All rights reserved. Next-Gen AI Security Platform.
      </footer>
    </div>
  );
};
