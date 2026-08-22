import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, User, Mail, Building, Lock, Eye, EyeOff, ArrowRight, AlertTriangle, Loader2 } from "lucide-react";

interface SignupProps {
  onNavigate: (page: string) => void;
}

export const Signup: React.FC<SignupProps> = ({ onNavigate }) => {
  const { signup } = useAuth();
  
  // Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name || name.trim().length === 0) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid work email.");
      return;
    }
    if (!company || company.trim().length === 0) {
      setErrorMsg("Please enter your company/organization.");
      return;
    }
    if (!password || password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await signup(name, email, company, password);
      onNavigate("dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-[#18152B] font-sans relative overflow-hidden bg-[#F8F7FC]">
      
      {/* LEFT SIDE — BRAND EXPERIENCE (~45% width on desktop) */}
      <div className="w-full md:w-[45%] bg-gradient-to-b from-[#18152B] via-[#312E81] to-[#4F46E5] p-8 md:p-12 lg:p-16 flex flex-col justify-between relative shrink-0 overflow-hidden text-white">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#7C3AED]/25 rounded-full filter blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#E11D8D]/20 rounded-full filter blur-[100px] pointer-events-none" />
        
        {/* SVG Visualization Background */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20%" cy="30%" r="5" fill="#E11D8D" />
          <circle cx="80%" cy="40%" r="7" fill="#4F46E5" />
          <circle cx="50%" cy="75%" r="9" fill="#7C3AED" />
          <path d="M 120 180 Q 220 80 320 180 Q 320 300 220 380 Q 120 300 120 180 Z" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="80" y1="120" x2="220" y2="80" stroke="#FFFFFF" strokeWidth="0.5" />
          <line x1="220" y1="80" x2="360" y2="120" stroke="#FFFFFF" strokeWidth="0.5" />
          <line x1="80" y1="120" x2="80" y2="280" stroke="#FFFFFF" strokeWidth="0.5" />
          <line x1="360" y1="120" x2="360" y2="280" stroke="#FFFFFF" strokeWidth="0.5" />
          <line x1="80" y1="280" x2="220" y2="380" stroke="#FFFFFF" strokeWidth="0.5" />
          <line x1="360" y1="280" x2="220" y2="380" stroke="#FFFFFF" strokeWidth="0.5" />
        </svg>

        {/* Brand Shield Logo Header */}
        <div className="flex items-center gap-3 relative z-10 select-none">
          <Shield className="w-8 h-8 text-[#E11D8D]" />
          <div className="flex flex-col">
            <span className="text-[18px] font-black tracking-widest leading-none">AGENTGUARD AI</span>
            <span className="text-[10px] font-extrabold tracking-widest text-[#E0E7FF]/60 uppercase mt-1">
              RELIABILITY PLATFORM
            </span>
          </div>
        </div>

        {/* Promo Title and Capabilities list */}
        <div className="my-auto py-12 space-y-10 relative z-10">
          <div className="space-y-4">
            <h1 className="text-[36px] lg:text-[44px] font-black tracking-tight leading-[1.15] text-white">
              Secure AI before it reaches{" "}
              <span className="bg-gradient-to-r from-[#E0E7FF] via-[#FCE7F3] to-[#E11D8D] bg-clip-text text-transparent">
                production.
              </span>
            </h1>
            <p className="text-[15px] lg:text-[16px] text-[#E0E7FF]/80 leading-relaxed font-medium max-w-lg">
              Create an account and immediately configure verification parameters for your system agents.
            </p>
          </div>

          {/* Capabilities Cards */}
          <div className="space-y-3.5 max-w-md">
            {[
              "Automated Red Teaming",
              "Isolated Sandbox Testing",
              "Reliability & Risk Scoring"
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 px-4.5 py-3.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-sm transition-all duration-300 hover:bg-white/10 hover:border-white/15"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#10B981] flex items-center justify-center text-[12px] font-black shrink-0">
                  ✓
                </div>
                <span className="text-[14px] lg:text-[15px] font-bold text-[#E0E7FF]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Left Side Footer */}
        <div className="text-[12px] text-[#E0E7FF]/50 font-bold relative z-10">
          &copy; {new Date().getFullYear()} AgentGuard AI. Enterprise Grade AI Security.
        </div>
      </div>

      {/* RIGHT SIDE — SIGN UP FORM */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-12 lg:p-16 relative bg-[#F8F7FC] items-center overflow-y-auto">
        
        {/* Top Header */}
        <div className="w-full max-w-[440px] flex flex-col items-center text-center mt-2">
          <div className="flex items-center gap-2 mb-4 select-none cursor-pointer" onClick={() => onNavigate("landing")}>
            <Shield className="w-8 h-8 text-[#4F46E5]" />
            <span className="text-[18px] font-black tracking-widest text-[#18152B]">AGENTGUARD AI</span>
          </div>
          
          <h2 className="text-[32px] font-black tracking-tight text-[#18152B] leading-none">Create account</h2>
          <p className="text-[15px] text-[#64748B] font-semibold mt-2">
            Get started with your AgentGuard workspace.
          </p>
        </div>

        {/* Main signup Form Card */}
        <div className="w-full max-w-[440px] my-auto py-6">
          
          {errorMsg && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-[#EF4444] text-[14px] font-semibold animate-shake">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name field */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-[#18152B] block">Full name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#64748B] pointer-events-none">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full h-[52px] pl-11 pr-4 bg-[#FFFFFF] border border-[#E5E7EB] focus:border-[#4F46E5] rounded-[12px] text-[16px] font-semibold focus:outline-none focus:ring-4 focus:ring-[#4F46E5]/10 transition-all placeholder:text-[#64748B]/50"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-[#18152B] block">Work email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#64748B] pointer-events-none">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full h-[52px] pl-11 pr-4 bg-[#FFFFFF] border border-[#E5E7EB] focus:border-[#4F46E5] rounded-[12px] text-[16px] font-semibold focus:outline-none focus:ring-4 focus:ring-[#4F46E5]/10 transition-all placeholder:text-[#64748B]/50"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Company field */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-[#18152B] block">Company / Organization</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#64748B] pointer-events-none">
                  <Building className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Acme Corporation"
                  className="w-full h-[52px] pl-11 pr-4 bg-[#FFFFFF] border border-[#E5E7EB] focus:border-[#4F46E5] rounded-[12px] text-[16px] font-semibold focus:outline-none focus:ring-4 focus:ring-[#4F46E5]/10 transition-all placeholder:text-[#64748B]/50"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-[#18152B] block">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#64748B] pointer-events-none">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password (min 8 chars)"
                  className="w-full h-[52px] pl-11 pr-12 bg-[#FFFFFF] border border-[#E5E7EB] focus:border-[#4F46E5] rounded-[12px] text-[16px] font-semibold focus:outline-none focus:ring-4 focus:ring-[#4F46E5]/10 transition-all placeholder:text-[#64748B]/50"
                  required
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#64748B] hover:text-[#18152B] cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-[#18152B] block">Confirm password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#64748B] pointer-events-none">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full h-[52px] pl-11 pr-4 bg-[#FFFFFF] border border-[#E5E7EB] focus:border-[#4F46E5] rounded-[12px] text-[16px] font-semibold focus:outline-none focus:ring-4 focus:ring-[#4F46E5]/10 transition-all placeholder:text-[#64748B]/50"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[52px] mt-4 rounded-[12px] bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:shadow-lg hover:shadow-[#4F46E5]/25 hover:-translate-y-0.5 active:translate-y-0 text-[15px] font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating workspace...
                </>
              ) : (
                <>
                  Create workspace <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Sign in redirect link */}
          <div className="mt-6 text-center text-[15px] font-bold">
            <span className="text-[#64748B] font-semibold">Already have an account? </span>
            <button
              onClick={() => onNavigate("login")}
              className="text-[#4F46E5] hover:underline cursor-pointer font-extrabold"
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Right Side Footer (Terms & Policies) */}
        <div className="w-full max-w-[440px] flex flex-col items-center gap-2 text-[12px] text-[#64748B] font-bold border-t border-[#E5E7EB]/55 pt-4 mt-2">
          <div className="flex items-center gap-1.5 text-[#18152B]/75 uppercase tracking-wider text-[10px]">
            <Shield className="w-4 h-4 text-[#4F46E5]" /> Protected by AgentGuard security infrastructure
          </div>
          <div className="flex gap-4 mt-1 font-semibold text-[#64748B]">
            <a href="#privacy" className="hover:text-[#4F46E5] transition-all">Privacy Policy</a>
            <span>&middot;</span>
            <a href="#terms" className="hover:text-[#4F46E5] transition-all">Terms of Service</a>
          </div>
        </div>

      </div>

    </div>
  );
};
