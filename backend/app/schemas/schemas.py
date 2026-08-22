from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class ToolBase(BaseModel):
    name: str
    description: str
    parameters: Optional[Any] = None
    risk_level: str = "LOW"

class ToolCreate(ToolBase):
    pass

class ToolOut(ToolBase):
    id: int
    agent_id: int

    model_config = {"from_attributes": True}

class AgentVersionOut(BaseModel):
    id: int
    agent_id: int
    version_num: str
    system_prompt: str
    description: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class AgentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    domain: str
    system_prompt: str
    model: str
    version: str = "V1.0.0"
    tools: List[ToolCreate] = []
    guardrails: Optional[Any] = None

class AgentOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    domain: str
    system_prompt: str
    model: str
    current_version: str
    created_at: datetime
    tools: List[ToolOut] = []
    guardrails: Optional[Any] = None

    model_config = {"from_attributes": True}

class TestScenarioCreate(BaseModel):
    category: str
    prompt: str
    expected_behavior: str
    risk_level: str = "LOW"
    expected_tool: Optional[str] = None

class TestScenarioOut(BaseModel):
    id: int
    agent_id: int
    category: str
    prompt: str
    expected_behavior: str
    risk_level: str
    expected_tool: Optional[str] = None

    model_config = {"from_attributes": True}

class EvaluationStartRequest(BaseModel):
    agent_id: int
    version_id: Optional[int] = None
    version_num: Optional[str] = None
    test_count: int = 10
    categories: List[str] = []

class EvaluationOut(BaseModel):
    id: int
    agent_id: int
    agent_version_id: int
    name: str
    status: str
    total_tests: int
    passed_tests: int
    failed_tests: int
    reliability_score: float
    safety_score: float
    tool_usage_score: float
    goal_adherence_score: float
    hallucination_score: float
    injection_score: float
    recovery_score: float
    created_at: datetime

    model_config = {"from_attributes": True}

class ExecutionTraceOut(BaseModel):
    id: int
    test_run_id: int
    type: str
    message: str
    timestamp: datetime
    details: Optional[Any] = None

    model_config = {"from_attributes": True}

class EvidenceOut(BaseModel):
    id: int
    failure_id: int
    rule_triggered: str
    observed_behavior: str
    expected_behavior: str
    confidence: float
    reasoning_summary: str

    model_config = {"from_attributes": True}

class RecommendationOut(BaseModel):
    id: int
    failure_id: int
    recommendation: str
    priority: str
    created_at: datetime

    model_config = {"from_attributes": True}

class FailureOut(BaseModel):
    id: int
    test_run_id: int
    type: str
    severity: str
    evidence_summary: Optional[str] = None
    expected: Optional[str] = None
    actual: Optional[str] = None
    affected_tool: Optional[str] = None
    potential_impact: Optional[str] = None
    created_at: datetime
    evidence_items: List[EvidenceOut] = []
    recommendations: List[RecommendationOut] = []

    model_config = {"from_attributes": True}

class RiskAssessmentOut(BaseModel):
    id: int
    test_run_id: int
    likelihood: str
    impact: str
    risk_level: str
    potential_impact: Optional[str] = None
    affected_tool: Optional[str] = None

    model_config = {"from_attributes": True}

class TestRunOut(BaseModel):
    id: int
    evaluation_id: int
    scenario_id: int
    status: str
    actual_behavior: Optional[str] = None
    execution_time: float
    risk_rating: str
    scenario: TestScenarioOut
    traces: List[ExecutionTraceOut] = []
    failures: List[FailureOut] = []
    risk_assessment: Optional[RiskAssessmentOut] = None

    model_config = {"from_attributes": True}

class ReportOut(BaseModel):
    id: int
    evaluation_id: int
    report_type: str
    generated_at: datetime
    summary_json: Any

    model_config = {"from_attributes": True}

class MetricCompare(BaseModel):
    v1_value: float
    v2_value: float
    delta: float
    status: str  # IMPROVED, REGRESSED, UNCHANGED

class VersionComparison(BaseModel):
    v1_version: str
    v2_version: str
    reliability: MetricCompare
    safety: MetricCompare
    tool_usage: MetricCompare
    goal_adherence: MetricCompare
    hallucination: MetricCompare
    injection: MetricCompare
    recovery: MetricCompare
    new_failures_count: int
    resolved_failures_count: int
    regressions: List[Any] = []
