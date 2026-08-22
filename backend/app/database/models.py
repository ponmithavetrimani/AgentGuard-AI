import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .connection import Base

class Agent(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    domain = Column(String, nullable=False)
    system_prompt = Column(Text, nullable=False)
    model = Column(String, nullable=False)
    current_version = Column(String, default="V1.0.0")
    guardrails = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    versions = relationship("AgentVersion", back_populates="agent", cascade="all, delete-orphan")
    tools = relationship("Tool", back_populates="agent", cascade="all, delete-orphan")
    scenarios = relationship("TestScenario", back_populates="agent", cascade="all, delete-orphan")
    evaluations = relationship("Evaluation", back_populates="agent", cascade="all, delete-orphan")

class AgentVersion(Base):
    __tablename__ = "agent_versions"
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    version_num = Column(String, nullable=False)
    system_prompt = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    agent = relationship("Agent", back_populates="versions")
    evaluations = relationship("Evaluation", back_populates="version")

class Tool(Base):
    __tablename__ = "tools"
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    parameters = Column(JSON, nullable=True)  # JSON description of parameter keys/types
    risk_level = Column(String, default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL

    agent = relationship("Agent", back_populates="tools")

class TestScenario(Base):
    __tablename__ = "test_scenarios"
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    category = Column(String, nullable=False)  # Normal, Edge Case, Adversarial, etc.
    prompt = Column(Text, nullable=False)
    expected_behavior = Column(Text, nullable=False)
    risk_level = Column(String, default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    expected_tool = Column(String, nullable=True)

    agent = relationship("Agent", back_populates="scenarios")
    test_runs = relationship("TestRun", back_populates="scenario", cascade="all, delete-orphan")

class Evaluation(Base):
    __tablename__ = "evaluations"
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    agent_version_id = Column(Integer, ForeignKey("agent_versions.id"), nullable=False)
    name = Column(String, nullable=False)
    status = Column(String, default="PENDING")  # PENDING, RUNNING, COMPLETED, FAILED
    total_tests = Column(Integer, default=0)
    passed_tests = Column(Integer, default=0)
    failed_tests = Column(Integer, default=0)
    
    # Scored indices (0-100)
    reliability_score = Column(Float, default=0.0)
    safety_score = Column(Float, default=0.0)
    tool_usage_score = Column(Float, default=0.0)
    goal_adherence_score = Column(Float, default=0.0)
    hallucination_score = Column(Float, default=0.0)
    injection_score = Column(Float, default=0.0)
    recovery_score = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    agent = relationship("Agent", back_populates="evaluations")
    version = relationship("AgentVersion", back_populates="evaluations")
    test_runs = relationship("TestRun", back_populates="evaluation", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="evaluation", cascade="all, delete-orphan")

class TestRun(Base):
    __tablename__ = "test_runs"
    id = Column(Integer, primary_key=True, index=True)
    evaluation_id = Column(Integer, ForeignKey("evaluations.id"), nullable=False)
    scenario_id = Column(Integer, ForeignKey("test_scenarios.id"), nullable=False)
    status = Column(String, default="PENDING")  # PASS, FAIL, PENDING
    actual_behavior = Column(Text, nullable=True)
    execution_time = Column(Float, default=0.0)  # in seconds
    risk_rating = Column(String, default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL

    evaluation = relationship("Evaluation", back_populates="test_runs")
    scenario = relationship("TestScenario", back_populates="test_runs")
    traces = relationship("ExecutionTrace", back_populates="test_run", cascade="all, delete-orphan")
    failures = relationship("Failure", back_populates="test_run", cascade="all, delete-orphan")
    risk_assessment = relationship("RiskAssessment", back_populates="test_run", uselist=False, cascade="all, delete-orphan")

class ExecutionTrace(Base):
    __tablename__ = "execution_traces"
    id = Column(Integer, primary_key=True, index=True)
    test_run_id = Column(Integer, ForeignKey("test_runs.id"), nullable=False)
    type = Column(String, nullable=False)  # LOG, TOOL_CALL, TOOL_RESPONSE, ERROR, SUCCESS
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    details = Column(JSON, nullable=True)

    test_run = relationship("TestRun", back_populates="traces")

class Failure(Base):
    __tablename__ = "failures"
    id = Column(Integer, primary_key=True, index=True)
    test_run_id = Column(Integer, ForeignKey("test_runs.id"), nullable=False)
    type = Column(String, nullable=False)  # Hallucination, Tool Loop, Unsafe Action, Goal Drift, Prompt Injection, etc.
    severity = Column(String, default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    evidence_summary = Column(Text, nullable=True)
    expected = Column(Text, nullable=True)
    actual = Column(Text, nullable=True)
    affected_tool = Column(String, nullable=True)
    potential_impact = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    test_run = relationship("TestRun", back_populates="failures")
    evidence_items = relationship("Evidence", back_populates="failure", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="failure", cascade="all, delete-orphan")

class Evidence(Base):
    __tablename__ = "evidence"
    id = Column(Integer, primary_key=True, index=True)
    failure_id = Column(Integer, ForeignKey("failures.id"), nullable=False)
    rule_triggered = Column(String, nullable=False)
    observed_behavior = Column(Text, nullable=False)
    expected_behavior = Column(Text, nullable=False)
    confidence = Column(Float, default=1.0)
    reasoning_summary = Column(Text, nullable=False)

    failure = relationship("Failure", back_populates="evidence_items")

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    id = Column(Integer, primary_key=True, index=True)
    test_run_id = Column(Integer, ForeignKey("test_runs.id"), nullable=False)
    likelihood = Column(String, default="LOW")  # LOW, MEDIUM, HIGH
    impact = Column(String, default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    risk_level = Column(String, default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    potential_impact = Column(Text, nullable=True)
    affected_tool = Column(String, nullable=True)

    test_run = relationship("TestRun", back_populates="risk_assessment")

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, index=True)
    failure_id = Column(Integer, ForeignKey("failures.id"), nullable=False)
    recommendation = Column(Text, nullable=False)
    priority = Column(String, default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    failure = relationship("Failure", back_populates="recommendations")

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    evaluation_id = Column(Integer, ForeignKey("evaluations.id"), nullable=False)
    report_type = Column(String, default="EXECUTIVE")  # EXECUTIVE, SECURITY, FULL
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    summary_json = Column(JSON, nullable=False)

    evaluation = relationship("Evaluation", back_populates="reports")
