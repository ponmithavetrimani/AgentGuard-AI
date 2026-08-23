import { Agent, Tool, TestScenario, Evaluation, TestRun, Failure, VersionComparison } from "../types";

const API_BASE = "https://agentguard-ai-0yjp.onrender.com/api";

export const api = {
  // --- AGENTS ---
  async getAgents(): Promise<Agent[]> {
    const res = await fetch(`${API_BASE}/agents`);
    if (!res.ok) throw new Error("Failed to fetch agents.");
    return res.json();
  },

  async getAgent(id: number): Promise<Agent> {
    const res = await fetch(`${API_BASE}/agents/${id}`);
    if (!res.ok) throw new Error("Failed to fetch agent details.");
    return res.json();
  },

  async createAgent(agent: {
    name: string;
    description: string;
    domain: string;
    system_prompt: string;
    model: string;
    version: string;
    tools: Tool[];
    guardrails?: any;
  }): Promise<Agent> {
    const res = await fetch(`${API_BASE}/agents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(agent)
    });
    if (!res.ok) throw new Error("Failed to create/configure agent.");
    return res.json();
  },

  async getAgentVersions(agentId: number): Promise<any[]> {
    const res = await fetch(`${API_BASE}/agents/${agentId}/versions`);
    if (!res.ok) throw new Error("Failed to fetch agent versions.");
    return res.json();
  },

  async analyzeAgent(agentId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/agents/${agentId}/analyze`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Failed to analyze agent prompt.");
    return res.json();
  },

  // --- SCENARIOS ---
  async generateScenarios(
    agentId: number,
    testCount: number,
    categories: string[]
  ): Promise<TestScenario[]> {
    const res = await fetch(`${API_BASE}/scenarios/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id: agentId, test_count: testCount, categories })
    });
    if (!res.ok) throw new Error("Failed to generate test scenarios.");
    return res.json();
  },

  async getScenarios(agentId: number): Promise<TestScenario[]> {
    const res = await fetch(`${API_BASE}/scenarios?agent_id=${agentId}`);
    if (!res.ok) throw new Error("Failed to get scenarios.");
    return res.json();
  },

  // --- EVALUATIONS & TRACES ---
  getEvaluationStreamUrl(
    agentId: number,
    versionId: number | null,
    testCount: number,
    categories: string[],
    versionNum?: string,
    evaluationId?: number | null
  ): string {
    const query = new URLSearchParams({
      agent_id: String(agentId),
      test_count: String(testCount)
    });
    if (versionId) query.append("version_id", String(versionId));
    if (versionNum) query.append("version_num", versionNum);
    if (evaluationId) query.append("evaluation_id", String(evaluationId));
    categories.forEach(c => query.append("categories", c));
    
    return `${API_BASE}/evaluations/start?${query.toString()}`;
  },

  async createEvaluation(req: {
    agent_id: number;
    version_id?: number | null;
    version_num?: string | null;
    test_count: number;
    categories?: string[];
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/evaluations/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req)
    });
    if (!res.ok) throw new Error("Failed to create evaluation run.");
    return res.json();
  },

  async validateEvaluation(
    agentId: number,
    versionNum?: string,
    versionId?: number
  ): Promise<{ status: string; message: string }> {
    const query = new URLSearchParams({ agent_id: String(agentId) });
    if (versionNum) query.append("version_num", versionNum);
    if (versionId) query.append("version_id", String(versionId));
    
    const res = await fetch(`${API_BASE}/evaluations/validate?${query.toString()}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Validation failed before starting evaluation.");
    }
    return res.json();
  },

  async getAgentEvaluations(agentId: number): Promise<Evaluation[]> {
    const res = await fetch(`${API_BASE}/agents/${agentId}/evaluations`);
    if (!res.ok) throw new Error("Failed to fetch agent evaluations.");
    return res.json();
  },

  async getEvaluation(id: number): Promise<Evaluation> {
    const res = await fetch(`${API_BASE}/evaluations/${id}`);
    if (!res.ok) throw new Error("Failed to fetch evaluation.");
    return res.json();
  },

  async getEvaluationResults(id: number): Promise<TestRun[]> {
    const res = await fetch(`${API_BASE}/evaluations/${id}/results`);
    if (!res.ok) throw new Error("Failed to fetch test runs.");
    return res.json();
  },

  async runRedTeam(evaluationId: number): Promise<any[]> {
    const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/redteam`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Failed to execute Red-Team audit.");
    return res.json();
  },

  // --- FAILURES & EVIDENCE ---
  async getFailures(evaluationId: number): Promise<Failure[]> {
    const res = await fetch(`${API_BASE}/failures?evaluation_id=${evaluationId}`);
    if (!res.ok) throw new Error("Failed to fetch evaluation failures.");
    return res.json();
  },

  async getFailureDetails(id: number): Promise<Failure> {
    const res = await fetch(`${API_BASE}/failures/${id}`);
    if (!res.ok) throw new Error("Failed to fetch failure details.");
    return res.json();
  },

  async generateRecommendations(failureId: number): Promise<any[]> {
    const res = await fetch(`${API_BASE}/failures/${failureId}/recommendation`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Failed to generate recommendations.");
    return res.json();
  },

  // --- REPLAY ---
  getReplayStreamUrl(testRunId: number): string {
    return `${API_BASE}/tests/${testRunId}/replay`;
  },

  // --- VERSION COMPARISON ---
  async getVersionComparison(agentId: number): Promise<VersionComparison> {
    const res = await fetch(`${API_BASE}/agents/${agentId}/comparison`);
    if (!res.ok) throw new Error("Failed to fetch version comparison data.");
    return res.json();
  },

  // --- REPORTS ---
  async generateReport(evaluationId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evaluation_id: evaluationId })
    });
    if (!res.ok) throw new Error("Failed to generate report.");
    return res.json();
  }
};
