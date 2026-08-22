import React, { useState, useEffect } from "react";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { AgentSetup } from "./pages/AgentSetup";
import { AgentAnalyzer } from "./pages/AgentAnalyzer";
import { ScenarioGenerator } from "./pages/ScenarioGenerator";
import { RedTeam } from "./pages/RedTeam";
import { Sandbox } from "./pages/Sandbox";
import { Results } from "./pages/Results";
import { FailureDetails } from "./pages/FailureDetails";
import { VersionCompare } from "./pages/VersionCompare";
import { Report } from "./pages/Report";
import { SettingsPage } from "./pages/Settings";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ForgotPassword } from "./pages/ForgotPassword";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider, useNotifications } from "./context/NotificationContext";
import { NotificationBell } from "./components/NotificationBell";
import { api } from "./services/api";
import { Agent } from "./types";
import { 
  Shield, LayoutDashboard, Cpu, Settings, Layers, 
  ShieldAlert, Settings2, ArrowLeft, LogOut
} from "lucide-react";

function MainAppContent() {
  const { isAuthenticated, isDemoMode, user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>("landing");
  const [agents, setAgents] = useState<Agent[]>([]);
  
  // Navigation parameter cache
  const [params, setParams] = useState<any>({
    agentId: 0, // Default to 0 (Create New Agent state)
    evaluationId: 101,
    failureId: 1,
    testCount: 100,
    categories: ["Normal", "Edge Case", "Ambiguous", "Safety", "Prompt Injection", "Failure Recovery", "Tool Misuse"]
  });

  const navigateTo = (page: string, newParams?: any) => {
    setCurrentPage(page);
    if (newParams) {
      setParams((prev: any) => ({ ...prev, ...newParams }));
    }
  };

  // Sync agents list and active agent ID
  useEffect(() => {
    async function loadAgents() {
      if (!isAuthenticated) return;
      try {
        const list = await api.getAgents();
        setAgents(list);
        
        const savedId = localStorage.getItem("ag_current_agent_id");
        if (savedId) {
          const idNum = Number(savedId);
          if (idNum === 1) {
            localStorage.removeItem("ag_current_agent_id");
            setParams((prev: any) => ({ ...prev, agentId: 0 }));
          } else if (list.some(a => a.id === idNum)) {
            setParams((prev: any) => ({ ...prev, agentId: idNum }));
          }
        }
      } catch (e) {
        console.error("Failed to load agents in app root:", e);
      }
    }
    loadAgents();
  }, [currentPage, isAuthenticated]);

  // Redirect unauthenticated users trying to access protected routes to /login
  useEffect(() => {
    const publicPages = ["landing", "login", "signup", "forgot-password"];
    if (!publicPages.includes(currentPage) && !isAuthenticated) {
      setCurrentPage("login");
    }
  }, [currentPage, isAuthenticated]);

  const getPageTitle = () => {
    switch (currentPage) {
      case "dashboard": return "Command Center";
      case "agents": return "Agent Profile Creator";
      case "analyzer": return "Static Guardrail Scan";
      case "scenarios": return "Exploit Scenario Builder";
      case "redteam": return "Red Team Attack Lab";
      case "sandbox": return "Sandbox Terminal Room";
      case "results": return "Reliability Audit Results";
      case "failures": return "Forensic Analysis Log";
      case "compare": return "Regression Diffs Overlay";
      case "report": return "Executive Assessment Summary";
      case "settings": return "Platform Settings";
      default: return "Dashboard";
    }
  };

  // 1. Full-screen Public Pages layouts (No sidebar or header shell)
  if (currentPage === "landing") {
    return <Landing onNavigate={navigateTo} />;
  }

  if (currentPage === "login") {
    return <Login onNavigate={navigateTo} />;
  }

  if (currentPage === "signup") {
    return <Signup onNavigate={navigateTo} />;
  }

  if (currentPage === "forgot-password") {
    return <ForgotPassword onNavigate={navigateTo} />;
  }

  // 2. Dashboard Shell Layout (With Sidebar & Header)
  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#18152B] flex relative">
      {/* Background Decorative Glow Blobs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-glow-indigo rounded-full pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-glow-rose rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-glow-purple rounded-full pointer-events-none" />

      {/* Sidebar Navigation */}
      <aside className="w-[280px] bg-gradient-to-b from-[#18152B] to-[#312E81] text-white flex flex-col justify-between shrink-0 select-none shadow-xl z-[100]">
        <div className="space-y-6">
          {/* Brand header */}
          <div 
            onClick={() => navigateTo("landing")}
            className="px-6 py-5 flex items-center gap-2 border-b border-white/10 cursor-pointer hover:bg-white/5"
          >
            <Shield className="w-6 h-6 text-[#E11D8D]" />
            <div className="flex flex-col">
              <span className="text-[18px] font-black tracking-wider text-white">AGENTGUARD AI</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E0E7FF]/60">
                RELIABILITY PLATFORM
              </span>
            </div>
          </div>

          {/* Operational Status indicator */}
          <div className="px-6 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] pulse-green" />
            <span className="text-[12px] font-extrabold tracking-widest text-[#10B981] uppercase">
              SYSTEM OPERATIONAL
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-2 text-[15px] font-bold text-white/70">
            <button
              onClick={() => navigateTo("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${
                currentPage === "dashboard" 
                  ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-md shadow-[#4F46E5]/20 ring-1 ring-white/10" 
                  : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-5 h-5 text-white" /> Dashboard
            </button>

            <button
              onClick={() => navigateTo("agents", { agentId: 0 })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${
                currentPage === "agents" 
                  ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-md shadow-[#4F46E5]/20 ring-1 ring-white/10" 
                  : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <Cpu className="w-5 h-5 text-white" /> Setup Agent
            </button>

            <button
              onClick={() => navigateTo("analyzer")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${
                currentPage === "analyzer" 
                  ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-md shadow-[#4F46E5]/20 ring-1 ring-white/10" 
                  : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <ShieldAlert className="w-5 h-5 text-white" /> Static Scan
            </button>

            <button
              onClick={() => navigateTo("scenarios")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${
                currentPage === "scenarios" 
                  ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-md shadow-[#4F46E5]/20 ring-1 ring-white/10" 
                  : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <Settings2 className="w-5 h-5 text-white" /> Scenario Generator
            </button>

            <button
              onClick={() => navigateTo("redteam")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${
                currentPage === "redteam" 
                  ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-md shadow-[#4F46E5]/20 ring-1 ring-white/10" 
                  : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <ShieldAlert className="w-5 h-5 text-[#E11D8D] animate-pulse" /> Red Team Panel
            </button>

            <button
              onClick={() => navigateTo("compare")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${
                currentPage === "compare" 
                  ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-md shadow-[#4F46E5]/20 ring-1 ring-white/10" 
                  : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <Layers className="w-5 h-5 text-white" /> Regression Compare
            </button>

            <button
              onClick={() => navigateTo("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${
                currentPage === "settings" 
                  ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-md shadow-[#4F46E5]/20 ring-1 ring-white/10" 
                  : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <Settings className="w-5 h-5 text-white" /> Settings
            </button>
          </nav>
        </div>

        {/* Back Link & Logout Section */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => navigateTo("landing")}
            className="w-full flex items-center gap-2 text-[14px] font-bold text-white/50 hover:text-white p-2 rounded transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Landing
          </button>
          
          <button
            onClick={() => {
              logout();
              navigateTo("landing");
            }}
            className="w-full flex items-center gap-2 text-[14px] font-bold text-red-300 hover:text-red-250 p-2 rounded transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-w-0 z-0">
        
        {/* Top Header */}
        <header className="h-20 border-b border-[#E5E7EB] bg-[#FFFFFF] px-6 flex items-center justify-between shrink-0 print:hidden select-none z-[200] sticky top-0">
          <div className="flex items-center gap-2 text-[14px] md:text-[15px]">
            <span className="text-[#64748B] font-medium">AgentGuard AI</span>
            <span className="text-[#E5E7EB] font-bold">/</span>
            <span className="font-bold text-[#18152B]">{getPageTitle()}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Agent Selector */}
            {isAuthenticated && agents.length > 0 && (
              <div className="flex items-center gap-2 mr-2">
                <span className="text-[12px] font-extrabold uppercase text-[#64748B] hidden sm:block">Active Agent:</span>
                <select
                  value={params.agentId}
                  onChange={e => {
                    const newId = Number(e.target.value);
                    setParams((prev: any) => ({ ...prev, agentId: newId }));
                    localStorage.setItem("ag_current_agent_id", String(newId));
                  }}
                  className="bg-slate-50 border border-[#E5E7EB] rounded-xl px-3 py-1.5 text-[13px] font-bold text-[#18152B] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                >
                  {agents.map(ag => (
                    <option key={ag.id} value={ag.id}>{ag.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* DEMO / SANDBOX MODE indicator */}
            {isDemoMode ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FCE7F3] text-[13px] font-black text-[#E11D8D] border border-[#FCE7F3]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E11D8D] pulse-red" />
                ● DEMO / PLAYGROUND ACTIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E0E7FF] text-[13px] font-black text-[#4F46E5] border border-[#DDD6FE]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5] pulse-green" />
                ● SECURE WORKSPACE
              </span>
            )}
            
            {/* Functional Notification Bell with dropdown */}
            <NotificationBell onNavigate={navigateTo} />
            
            <div className="flex items-center gap-3 border-l border-[#E5E7EB] pl-4">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.name || "User"} 
                  className="w-9 h-9 rounded-full object-cover border border-[#E5E7EB] select-none"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-[14px] text-white font-extrabold select-none">
                  {user?.name ? user.name[0].toUpperCase() : "G"}
                </div>
              )}
              <div className="flex flex-col items-start justify-center leading-normal">
                <span className="text-[14px] font-bold text-[#18152B]">{user?.name || "Guest Auditor"}</span>
                {user?.email && (
                  <span className="text-[11px] text-[#64748B] font-medium leading-none mb-0.5">{user.email}</span>
                )}
                <button
                  onClick={() => {
                    logout();
                    navigateTo("landing");
                  }}
                  className="text-[11px] font-bold text-[#EF4444] hover:underline cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Internal Page router container */}
        <main className="flex-1 overflow-y-auto min-h-0">
          {currentPage === "dashboard" && (
            <Dashboard agentId={params.agentId} onNavigate={navigateTo} />
          )}
          {currentPage === "agents" && (
            <AgentSetup agentId={params.agentId} onNavigate={navigateTo} />
          )}
          {currentPage === "analyzer" && (
            <AgentAnalyzer agentId={params.agentId} onNavigate={navigateTo} />
          )}
          {currentPage === "scenarios" && (
            <ScenarioGenerator agentId={params.agentId} onNavigate={navigateTo} />
          )}
          {currentPage === "redteam" && (
            <RedTeam agentId={params.agentId} onNavigate={navigateTo} />
          )}
          {currentPage === "sandbox" && (
            <Sandbox
              agentId={params.agentId}
              testCount={params.testCount}
              categories={params.categories}
              evaluationId={params.evaluationId}
              version={params.version}
              onNavigate={navigateTo}
            />
          )}
          {currentPage === "results" && (
            <Results
              evaluationId={params.evaluationId}
              version={params.version || "V2.0.0"}
              onNavigate={navigateTo}
            />
          )}
          {currentPage === "failures" && (
            <FailureDetails
              failureId={params.failureId}
              testRunId={params.testRunId}
              onNavigate={navigateTo}
            />
          )}
          {currentPage === "compare" && (
            <VersionCompare agentId={params.agentId} onNavigate={navigateTo} />
          )}
          {currentPage === "report" && (
            <Report evaluationId={params.evaluationId} onNavigate={navigateTo} />
          )}
          {currentPage === "settings" && (
            <SettingsPage />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainAppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
