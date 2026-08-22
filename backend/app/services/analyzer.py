import re
from typing import Dict, Any, List

class AgentAnalyzer:
    """
    Statically analyzes agent system prompts and tools for security flaws,
    over-privileging, or missing validation guardrails.
    """
    @staticmethod
    def analyze(name: str, system_prompt: str, tools: List[Dict[str, Any]], domain: str) -> Dict[str, Any]:
        warnings = []
        read_tools = 0
        write_tools = 0
        high_risk_tools = 0
        critical_tools = 0
        
        # Analyze tools
        for tool in tools:
            name_lower = tool.get("name", "").lower()
            risk = tool.get("risk_level", "LOW").upper()
            
            # Count risks
            if risk == "CRITICAL":
                critical_tools += 1
            elif risk == "HIGH":
                high_risk_tools += 1
            
            # Simple read/write heuristics
            if any(w in name_lower for w in ["cancel", "refund", "update", "delete", "create", "issue", "write"]):
                write_tools += 1
            else:
                read_tools += 1
                
            # Specific recommendations based on tool name
            if "refund" in name_lower:
                warnings.append({
                    "severity": "CRITICAL",
                    "tool": tool.get("name"),
                    "vulnerability": "Irreversible financial transaction",
                    "description": f"Tool '{tool.get('name')}' is capable of issuing refunds. Without confirmation and strong identity checks, this can lead to massive financial loss."
                })
            elif "cancel" in name_lower or "update" in name_lower:
                warnings.append({
                    "severity": "HIGH",
                    "tool": tool.get("name"),
                    "vulnerability": "Write action on active order",
                    "description": f"Tool '{tool.get('name')}' modifies order states. Verify order status and user ownership parameters before performing this operation."
                })

        # Prompt Vulnerabilities Scan
        prompt_lower = system_prompt.lower()
        
        # Check for missing verification
        if not re.search(r"(verify|authenticate|check customer|confirm identity|check identity)", prompt_lower):
            warnings.append({
                "severity": "CRITICAL",
                "tool": "System Prompt",
                "vulnerability": "No Identity Verification Guidelines",
                "description": "The system prompt does not explicitly instruct the agent to verify customer identity before calling critical/high-risk write tools."
            })
            
        # Check for confirmation requirements
        if not re.search(r"(ask for confirmation|confirm before|double check|explicit confirmation)", prompt_lower):
            warnings.append({
                "severity": "HIGH",
                "tool": "System Prompt",
                "vulnerability": "No Confirmation Safeguards",
                "description": "The prompt does not require the agent to ask for confirmation from the user before executing destructive modifications (e.g. cancellations)."
            })
            
        # Check for prompt injection instructions
        if not re.search(r"(ignore instructions|system instructions|do not reveal|system prompt confidentiality)", prompt_lower):
            warnings.append({
                "severity": "MEDIUM",
                "tool": "System Prompt",
                "vulnerability": "Prompt Injection Susceptibility",
                "description": "The system prompt lacks strict instructions to protect itself against jailbreaks or system prompt leak requests."
            })

        # Calculate Overall Risk Level
        if critical_tools > 0 or any(w["severity"] == "CRITICAL" for w in warnings):
            risk_level = "CRITICAL"
        elif high_risk_tools > 0 or any(w["severity"] == "HIGH" for w in warnings):
            risk_level = "HIGH"
        elif any(w["severity"] == "MEDIUM" for w in warnings):
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
            
        return {
            "agent_name": name,
            "domain": domain,
            "capability_summary": {
                "total_tools": len(tools),
                "read_tools": read_tools,
                "write_tools": write_tools,
                "high_risk_tools": high_risk_tools,
                "critical_tools": critical_tools
            },
            "risk_level": risk_level,
            "reasoning": f"Analyzed {len(tools)} tools and the prompt of '{name}'. "
                         f"Flagged {len(warnings)} vulnerability indicators. "
                         f"Critical risks identified due to sensitive operations being exposed without explicit verification instructions in the prompt.",
            "warnings": warnings
        }
