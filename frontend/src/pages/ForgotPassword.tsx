import React, { useState } from "react";
import { Shield, Mail, ArrowLeft, ArrowRight, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid work email.");
      return;
    }

    setSubmitting(true);
    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg("Failed to initiate password reset request. Please try again.");
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

        {/* Promo Title */}
        <div className="my-auto py-12 space-y-6 relative z-10">
          <h1 className="text-[36px] lg:text-[44px] font-black tracking-tight leading-[1.15] text-white">
            Access credentials restoration.
          </h1>
          <p className="text-[15px] lg:text-[16px] text-[#E0E7FF]/80 leading-relaxed font-medium max-w-lg">
            Follow standard workspace validation protocols to safely verify password reset keys.
          </p>
        </div>

        {/* Left Side Footer */}
        <div className="text-[12px] text-[#E0E7FF]/50 font-bold relative z-10">
          &copy; {new Date().getFullYear()} AgentGuard AI. Enterprise Grade AI Security.
        </div>
      </div>

      {/* RIGHT SIDE — FORGOT PASSWORD FORM */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-12 lg:p-16 relative bg-[#F8F7FC] items-center">
        
        {/* Top Header */}
        <div className="w-full max-w-[440px] flex flex-col items-center text-center mt-4">
          <div className="flex items-center gap-2 mb-6 select-none cursor-pointer" onClick={() => onNavigate("landing")}>
            <Shield className="w-8 h-8 text-[#4F46E5]" />
            <span className="text-[18px] font-black tracking-widest text-[#18152B]">AGENTGUARD AI</span>
          </div>
          
          <h2 className="text-[32px] font-black tracking-tight text-[#18152B] leading-none">Reset your password</h2>
          <p className="text-[15px] text-[#64748B] font-semibold mt-3 max-w-[340px]">
            Enter your work email and we'll send you instructions to reset your password.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="w-full max-w-[440px] my-auto py-8">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-[#EF4444] text-[14px] font-semibold">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success ? (
            <div className="p-6 bg-white border border-[#E5E7EB] rounded-3xl text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#10B981] flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-[18px] font-black text-[#18152B]">Reset link dispatched</h3>
              <p className="text-[14px] text-[#64748B] leading-relaxed font-semibold">
                An email containing password recovery tokens has been sent to <strong className="text-[#18152B]">{email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => onNavigate("login")}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-xl font-bold text-[14px] shadow-sm hover:shadow hover:shadow-[#4F46E5]/25 cursor-pointer"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email field */}
              <div className="space-y-2">
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-[52px] rounded-[12px] bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:shadow-lg hover:shadow-[#4F46E5]/25 hover:-translate-y-0.5 active:translate-y-0 text-[15px] font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    Send reset link
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back link */}
          <div className="mt-8 text-center text-[15px] font-bold">
            <button
              onClick={() => onNavigate("login")}
              className="text-[#64748B] hover:text-[#18152B] transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </button>
          </div>
        </div>

        {/* Right Side Footer (Terms & Policies) */}
        <div className="w-full max-w-[440px] flex flex-col items-center gap-2 text-[12px] text-[#64748B] font-bold border-t border-[#E5E7EB]/55 pt-4 mt-4">
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
