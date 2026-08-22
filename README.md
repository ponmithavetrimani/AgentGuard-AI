# 🛡️ AgentGuard AI
## AI Agent Reliability, Security & Evaluation Platform

> "Before you trust an AI Agent, let AgentGuard attack it."

AgentGuard AI is an AI-powered web platform designed to evaluate, stress-test, attack, and monitor autonomous AI agents in a safe sandbox environment before they are deployed to production users. It acts like **CI/CD + QA + Red Teaming + Security Testing** for your agent workflows.

---

## 🚀 Key Features

1. **Agent Setup & Configuration**: Register agent details, system prompts, models, versions, and tool specifications (with risk/criticality levels).
2. **Static Agent Analyzer**: Analyzes prompts and tools to perform automated vulnerability mapping (detecting dangerous actions, validation loops, missing confirmations).
3. **Scenario Generation Engine**: Generates standard and edge-case prompt vectors based on agent metadata (Safety, Ambiguity, Tool Misuse, etc.).
4. **AI Red-Team Attacker**: Launches targeted attacks (social engineering, prompt injection, fake authority, urgency pressure) directly at the agent.
5. **Safe Database Sandbox**: Emulates customer support tool execution in an isolated sandbox with database and API state mocks (Customers, Orders, Products, Payments) without real external API dependencies.
6. **Live Trace Stream**: View execution trace lines (inputs, tool calls, results, safety violations) step-by-step.
7. **Failure Mode Classifier**: Automatically classifies failures into modes like *Hallucination*, *Tool Loops*, *Unsafe Actions*, *Goal Drift*, *Injection*, and *Recovery Issues*.
8. **Evidence & Explainability**: Highlights concrete trace files, parameters, and violation rules leading to a failure verdict.
9. **AI Fix Recommendations**: Offers concrete step-by-step remediation plans for each failure mode.
10. **Reliability & Safety Scoring**: Outputs an weighted index from 0 to 100 on multiple metrics.
11. **Regression & Version Compare**: Tracks evaluations over agent iterations (V1 vs V2 vs V3), showing regression lines, new bugs, or resolved items.
12. **Printable Reports**: Generates executive reports showing readiness verdicts.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.13 + FastAPI + SQLite + SQLAlchemy
- **Frontend**: React + TypeScript + Vite + Tailwind CSS

---

## 🏁 Quick Start & Setup

### 1. Run the Backend
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Demo Mode (Zero API Key Requirement)
If no `LLM_API_KEY` is provided in your `.env` file, the platform automatically runs in a fully functional deterministic **Demo Mode**. This showcases the entire pipeline (V1 vs V2 analysis, red-teaming, sandbox logs, evidence, risk matrix, regression tracking, and PDF reports) instantly!
