export interface Tool {
  id?: number;
  name: string;
  description: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  parameters?: any;
}

export interface Agent {
  id: number;
  name: string;
  description?: string;
  domain: string;
  system_prompt: string;
  model: string;
  current_version: string;
  created_at: string;
  tools: Tool[];
  guardrails?: any;
}

export interface AgentVersion {
  id: number;
  agent_id: number;
  version_num: string;
  system_prompt: string;
  description?: string;
  created_at: string;
}

export interface TestScenario {
  id: number;
  agent_id: number;
  category: string;
  prompt: string;
  expected_behavior: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  expected_tool?: string;
}

export interface Evaluation {
  id: number;
  agent_id: number;
  agent_version_id: number;
  name: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  reliability_score: number;
  safety_score: number;
  tool_usage_score: number;
  goal_adherence_score: number;
  hallucination_score: number;
  injection_score: number;
  recovery_score: number;
  created_at: string;
}

export interface ExecutionTrace {
  id: number;
  test_run_id: number;
  type: "LOG" | "TOOL_CALL" | "TOOL_RESPONSE" | "ERROR" | "SUCCESS";
  message: string;
  timestamp: string;
  details?: any;
}

export interface Evidence {
  id: number;
  failure_id: number;
  rule_triggered: string;
  observed_behavior: string;
  expected_behavior: string;
  confidence: number;
  reasoning_summary: string;
}

export interface Recommendation {
  id: number;
  failure_id: number;
  recommendation: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  created_at: string;
}

export interface Failure {
  id: number;
  test_run_id: number;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  evidence_summary?: string;
  expected?: string;
  actual?: string;
  affected_tool?: string;
  potential_impact?: string;
  created_at: string;
  evidence_items: Evidence[];
  recommendations: Recommendation[];
}

export interface RiskAssessment {
  id: number;
  test_run_id: number;
  likelihood: "LOW" | "MEDIUM" | "HIGH";
  impact: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  potential_impact?: string;
  affected_tool?: string;
}

export interface TestRun {
  id: number;
  evaluation_id: number;
  scenario_id: number;
  status: "PASS" | "FAIL" | "PENDING";
  actual_behavior?: string;
  execution_time: number;
  risk_rating: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  scenario: TestScenario;
  traces: ExecutionTrace[];
  failures: Failure[];
  risk_assessment?: RiskAssessment;
}

export interface MetricCompare {
  v1_value: number;
  v2_value: number;
  delta: number;
  status: "IMPROVED" | "REGRESSED" | "UNCHANGED";
}

export interface VersionComparison {
  v1_version: string;
  v2_version: string;
  reliability: MetricCompare;
  safety: MetricCompare;
  tool_usage: MetricCompare;
  goal_adherence: MetricCompare;
  hallucination: MetricCompare;
  injection: MetricCompare;
  recovery: MetricCompare;
  new_failures_count: number;
  resolved_failures_count: number;
  regressions: any[];
}
