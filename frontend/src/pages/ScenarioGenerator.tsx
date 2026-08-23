import React, { useState } from "react";
import { api } from "../services/api";
import { Terminal, Settings2, Sliders, ArrowRight, Activity, Cpu } from "lucide-react";
import { TestScenario } from "../types";

interface ScenarioGeneratorProps {
  agentId: number;
  onNavigate: (page: string, params?: any) => void;
}

export const ScenarioGenerator: React.FC<ScenarioGeneratorProps> = ({ agentId, onNavigate }) => {
  const [testCount, setTestCount] = useState(100);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Normal", "Edge Case", "Ambiguous", "Safety", "Prompt Injection", "Failure Recovery", "Tool Misuse"
  ]);
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [generating, setGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState("HIGH");

  const categoriesOptions = [
    "Normal", "Edge Case", "Ambiguous", "Safety", "Prompt Injection", "Failure Recovery", "Tool Misuse"
  ];

  const handleToggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleGenerate = async () => {
    if (!agentId || agentId === 0) {
      alert("No agent selected. Please select an active agent first.");
      return;
    }
    setGenerating(true);
    try {
      const generated = await api.generateScenarios(agentId, testCount, selectedCategories);
      setScenarios(generated);
    } catch (e) {
      console.error(e);
      alert("Failed to generate scenarios.");
    } finally {
      setGenerating(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat.toUpperCase()) {
      case "NORMAL": return "bg-blue-50 text-blue-700 border-blue-200";
      case "SAFETY":
      case "UNSAFE ACTION": return "bg-red-50 text-red-700 border-red-200";
      case "PROMPT INJECTION": return "bg-purple-50 text-purple-700 border-purple-200";
      case "FAILURE RECOVERY": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  if (!agentId || agentId === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="p-8 text-center space-y-4 max-w-md mx-auto select-none pt-20">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-[#64748B] mx-auto">
            <Cpu className="w-8 h-8" />
          </div>
          <h3 className="text-[18px] font-black text-[#18152B]">No Agent Selected</h3>
          <p className="text-[14px] text-[#64748B] font-semibold leading-relaxed">
            Please select an active agent from the header dropdown to generate attack scenarios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Title */}
      <div className="border-b border-[#E5E7EB] pb-4">
        <h1 className="text-[30px] font-black text-[#18152B] flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-[#4F46E5]" /> Generate Attack Scenarios
        </h1>
        <p className="text-[14px] text-[#64748B] mt-1 font-semibold">
          Synthesize logical agent stress scenarios and vulnerability checks targeting prompts.
        </p>
      </div>

      {/* Control panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Categories Selector */}
        <div className="glass-card p-6 space-y-3 md:col-span-2 bg-[#FFFFFF]">
          <h3 className="text-[13px] font-black uppercase text-[#18152B] tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-[#4F46E5]" /> Attack Categories
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categoriesOptions.map(cat => {
              const active = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleToggleCategory(cat)}
                  className={`px-3 py-2.5 rounded-xl text-[14px] font-bold text-left border transition-all cursor-pointer ${
                    active
                      ? "bg-[#E0E7FF] text-[#4F46E5] border-[#4F46E5]"
                      : "bg-[#FFFFFF] text-[#64748B] border-[#E5E7EB] hover:bg-[#F8F7FC]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Configurations */}
        <div className="glass-card p-6 space-y-4 bg-[#FFFFFF] flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <span className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-wider block">Volume Count</span>
              <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                {[10, 25, 50, 100].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setTestCount(cnt)}
                    className={`py-1.5 text-[13px] font-bold rounded-lg border transition-all cursor-pointer ${
                      testCount === cnt
                        ? "bg-[#E0E7FF] text-[#4F46E5] border-[#4F46E5]"
                        : "bg-white text-gray-400 border-[#E5E7EB] hover:bg-[#F8F7FC]"
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[12px] text-[#64748B] font-extrabold uppercase tracking-wider block">Difficulty Rating</span>
              <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                {["LOW", "MEDIUM", "HIGH"].map(diff => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-1.5 text-[12px] font-bold rounded-lg border transition-all cursor-pointer ${
                      difficulty === diff
                        ? "bg-[#FCE7F3] text-[#E11D8D] border-[#E11D8D]"
                        : "bg-white text-gray-400 border-[#E5E7EB] hover:bg-[#F8F7FC]"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || selectedCategories.length === 0}
            className="w-full mt-4 h-12 text-[14px] font-black bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-90 disabled:bg-slate-100 disabled:text-slate-400 rounded-xl text-white transition-all shadow-md shadow-[#4F46E5]/15 cursor-pointer"
          >
            {generating ? "Synthesizing..." : "GENERATE SCENARIOS"}
          </button>
        </div>

      </div>

      {/* Scenario List */}
      {generating && (
        <div className="flex flex-col items-center justify-center p-12 gap-2">
          <Activity className="w-7 h-7 text-[#7C3AED] animate-spin" />
          <span className="text-[15px] text-[#64748B] font-bold">Generating validation cases with LLM reasoning...</span>
        </div>
      )}

      {!generating && scenarios.length > 0 && (
        <div className="glass-card p-6 space-y-4 bg-white">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <h3 className="text-[14px] font-black uppercase text-[#18152B] tracking-wider">
              Scenarios Queue ({scenarios.length} Scenarios)
            </h3>
            
            <button
              onClick={() => onNavigate("sandbox", { agentId, testCount, categories: selectedCategories })}
              className="h-11 px-5 text-[14px] font-black bg-[#4F46E5] hover:bg-[#312E81] text-white rounded-xl flex items-center gap-1.5 shadow-md shadow-[#4F46E5]/10 cursor-pointer"
            >
              Start Sandbox Simulation <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-[350px] overflow-y-auto space-y-3.5 pr-2">
            {scenarios.map((sc, idx) => (
              <div key={idx} className="bg-white border border-[#E5E7EB] p-4.5 rounded-2xl flex items-start gap-4 shadow-sm hover:border-[#DDD6FE] transition-all">
                <div className="p-2.5 rounded-xl bg-[#E0E7FF] text-[#4F46E5] shrink-0 mt-0.5">
                  <Terminal className="w-5 h-5" />
                </div>
                <div className="space-y-2 flex-1 text-[14px] leading-relaxed">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#18152B] text-[15px]">Scenario #{sc.id || idx + 1}</span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[12px] font-black uppercase border ${getCategoryBadge(sc.category)}`}>
                      {sc.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[12px] font-black uppercase border ${
                      sc.risk_level === "CRITICAL" ? "bg-red-50 text-[#EF4444] border-red-200" : "bg-amber-50 text-[#F59E0B] border-amber-200"
                    }`}>
                      {sc.risk_level}
                    </span>
                  </div>
                  
                  <p className="text-[#18152B] font-bold font-mono leading-relaxed">"{sc.prompt}"</p>
                  
                  <div className="text-[13px] text-[#64748B] pt-1 leading-normal font-semibold">
                    Expected Behavior: <span className="text-[#4F46E5] font-semibold">{sc.expected_behavior}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
