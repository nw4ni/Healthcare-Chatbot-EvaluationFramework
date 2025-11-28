"""
Reporting Module
Generates comprehensive reports documenting all experiments, changes, and results
"""
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

class ReportGenerator:
    """
    Generates final reports documenting:
    - Guardrails setup
    - Pipeline implementation
    - Baseline performance
    - Iterations and changes
    - Performance improvements
    - Trade-offs
    """
    
    def __init__(self):
        pass
    
    def generate_final_report(
        self,
        guardrails_config: Dict[str, Any],
        baseline_experiment: Dict[str, Any],
        experiments: List[Dict[str, Any]],
        pipeline_description: str
    ) -> Dict[str, Any]:
        """Generate comprehensive final report"""
        
        report = {
            "report_metadata": {
                "generated_at": datetime.now().isoformat(),
                "report_version": "1.0",
                "framework": "Healthcare Chatbot Evaluation Framework"
            },
            "section_1_guardrails_setup": {
                "title": "LLM Guardrails Setup",
                "description": "This section documents the guardrails implemented to measure different parts of the workflow",
                "guardrails": [
                    {
                        "name": "Safety Check",
                        "purpose": "Detect harmful content, self-harm indicators, and inappropriate language",
                        "implementation": "Keyword-based detection with configurable thresholds",
                        "metrics": "Safety score (0-100), harmful keyword count"
                    },
                    {
                        "name": "PII Protection",
                        "purpose": "Prevent leakage of personally identifiable information in bot responses",
                        "implementation": "Regex pattern matching for SSN, phone, email, credit card",
                        "metrics": "PII detection count, protection score (0-100)"
                    },
                    {
                        "name": "Medical Accuracy",
                        "purpose": "Ensure appropriate medical language and avoid guarantees",
                        "implementation": "Indicator-based scoring for medical context and language appropriateness",
                        "metrics": "Medical accuracy score (0-100)"
                    },
                    {
                        "name": "Relevance Check",
                        "purpose": "Measure if bot responses are relevant to user queries",
                        "implementation": "Keyword overlap analysis between user queries and bot responses",
                        "metrics": "Relevance score (0-100), average relevance percentage"
                    },
                    {
                        "name": "Coherence Check",
                        "purpose": "Ensure logical flow and consistency in conversations",
                        "implementation": "Topic consistency tracking and contradiction detection",
                        "metrics": "Coherence score (0-100), topic change count"
                    },
                    {
                        "name": "Completeness Check",
                        "purpose": "Verify bot provides complete information",
                        "implementation": "Indicator-based checking for greeting, confirmation, details, next steps",
                        "metrics": "Completeness score (0-100)"
                    },
                    {
                        "name": "Efficiency Check",
                        "purpose": "Measure conversation efficiency and turn count",
                        "implementation": "Turn count analysis with completion status consideration",
                        "metrics": "Efficiency score (0-100), turn count"
                    }
                ],
                "category_groupings": {
                    "safety": ["Safety Check", "PII Protection"],
                    "accuracy": ["Medical Accuracy"],
                    "quality": ["Relevance Check", "Coherence Check", "Completeness Check"],
                    "efficiency": ["Efficiency Check"]
                },
                "configuration": guardrails_config
            },
            "section_2_pipeline": {
                "title": "LLM/AI Pipeline Implementation",
                "description": pipeline_description,
                "components": [
                    {
                        "component": "Chatbot Core",
                        "description": "Main conversation handling and response generation"
                    },
                    {
                        "component": "Guardrails System",
                        "description": "Real-time validation and quality checks"
                    },
                    {
                        "component": "Analytics Engine",
                        "description": "Performance measurement and metrics calculation"
                    },
                    {
                        "component": "Experimentation Framework",
                        "description": "A/B testing and iteration tracking"
                    }
                ]
            },
            "section_3_baseline": {
                "title": "Baseline Performance Measurement",
                "description": "Initial performance measurement with guardrails",
                "baseline_experiment": baseline_experiment,
                "key_metrics": {
                    "overall_guardrail_score": baseline_experiment.get("overall_guardrail_score", 0.0),
                    "completion_rate": baseline_experiment.get("completion_rate", 0.0),
                    "avg_turns": baseline_experiment.get("avg_turns", 0.0),
                    "sentiment_rate": baseline_experiment.get("sentiment_rate", 0.0),
                    "category_scores": baseline_experiment.get("guardrail_scores", {})
                }
            },
            "section_4_iterations": {
                "title": "Iterative Improvements and Experiments",
                "description": "Documentation of all changes made to improve performance",
                "total_iterations": len(experiments),
                "experiments": []
            },
            "section_5_analysis": {
                "title": "Performance Analysis and Results",
                "description": "Analysis of improvements, trade-offs, and recommendations"
            }
        }
        
        # Add experiment details
        improvements_summary = {
            "positive_improvements": 0,
            "negative_impacts": 0,
            "neutral_changes": 0,
            "best_improvements": [],
            "worst_impacts": []
        }
        
        for exp in experiments:
            exp_detail = {
                "experiment_id": exp.get("experiment_id"),
                "timestamp": exp.get("timestamp"),
                "pipeline_version": exp.get("pipeline_version"),
                "changes": exp.get("changes", []),
                "performance_metrics": {
                    "guardrail_score": exp.get("overall_guardrail_score", 0.0),
                    "completion_rate": exp.get("completion_rate", 0.0),
                    "avg_turns": exp.get("avg_turns", 0.0),
                    "sentiment_rate": exp.get("sentiment_rate", 0.0),
                    "efficiency_score": exp.get("efficiency_score", 0.0)
                },
                "improvements": exp.get("improvement", {}),
                "trade_offs": exp.get("trade_offs", []),
                "notes": exp.get("notes")
            }
            
            report["section_4_iterations"]["experiments"].append(exp_detail)
            
            # Analyze improvements
            improvements = exp.get("improvement", {})
            positive_count = sum(1 for v in improvements.values() if v > 0)
            negative_count = sum(1 for v in improvements.values() if v < 0)
            
            if positive_count > negative_count:
                improvements_summary["positive_improvements"] += 1
            elif negative_count > positive_count:
                improvements_summary["negative_impacts"] += 1
            else:
                improvements_summary["neutral_changes"] += 1
        
        # Find best and worst experiments
        if experiments:
            best_exp = max(experiments, key=lambda e: e.get("overall_guardrail_score", 0.0))
            worst_exp = min(experiments, key=lambda e: e.get("overall_guardrail_score", 0.0))
            
            improvements_summary["best_improvements"] = [{
                "experiment_id": best_exp.get("experiment_id"),
                "score": best_exp.get("overall_guardrail_score", 0.0),
                "key_improvements": {k: v for k, v in best_exp.get("improvement", {}).items() if v > 0}
            }]
            
            improvements_summary["worst_impacts"] = [{
                "experiment_id": worst_exp.get("experiment_id"),
                "score": worst_exp.get("overall_guardrail_score", 0.0),
                "key_issues": {k: v for k, v in worst_exp.get("improvement", {}).items() if v < 0}
            }]
        
        report["section_5_analysis"]["improvements_summary"] = improvements_summary
        
        # Calculate overall trends
        if len(experiments) > 0:
            baseline_score = baseline_experiment.get("overall_guardrail_score", 0.0)
            latest_score = experiments[-1].get("overall_guardrail_score", 0.0)
            
            report["section_5_analysis"]["overall_trends"] = {
                "baseline_to_latest": {
                    "guardrail_score_change": latest_score - baseline_score,
                    "completion_rate_change": experiments[-1].get("completion_rate", 0.0) - baseline_experiment.get("completion_rate", 0.0),
                    "efficiency_change": experiments[-1].get("efficiency_score", 0.0) - baseline_experiment.get("efficiency_score", 0.0)
                },
                "recommendations": self._generate_recommendations(baseline_experiment, experiments)
            }
        
        return report
    
    def _generate_recommendations(
        self,
        baseline: Dict[str, Any],
        experiments: List[Dict[str, Any]]
    ) -> List[str]:
        """Generate recommendations based on analysis"""
        recommendations = []
        
        if not experiments:
            return ["No experiments conducted yet. Start with baseline measurement."]
        
        # Analyze guardrail scores
        baseline_guardrail = baseline.get("overall_guardrail_score", 0.0)
        latest_guardrail = experiments[-1].get("overall_guardrail_score", 0.0)
        
        if latest_guardrail > baseline_guardrail:
            recommendations.append(
                f"✅ Guardrail score improved by {latest_guardrail - baseline_guardrail:.1f} points. "
                "Continue with current approach."
            )
        elif latest_guardrail < baseline_guardrail:
            recommendations.append(
                f"⚠️ Guardrail score decreased by {baseline_guardrail - latest_guardrail:.1f} points. "
                "Review recent changes and consider reverting problematic modifications."
            )
        
        # Analyze completion rate
        baseline_completion = baseline.get("completion_rate", 0.0)
        latest_completion = experiments[-1].get("completion_rate", 0.0)
        
        if latest_completion < 50:
            recommendations.append(
                "🚨 Completion rate is below 50%. Focus on simplifying the booking flow and reducing friction points."
            )
        
        # Analyze efficiency
        baseline_turns = baseline.get("avg_turns", 0.0)
        latest_turns = experiments[-1].get("avg_turns", 0.0)
        
        if latest_turns > 8:
            recommendations.append(
                f"⏱️ Average turns ({latest_turns:.1f}) is high. Consider streamlining conversation flow to reduce turn count."
            )
        
        # Category-specific recommendations
        latest_categories = experiments[-1].get("guardrail_scores", {})
        baseline_categories = baseline.get("guardrail_scores", {})
        
        for category in ["safety", "accuracy", "quality", "efficiency"]:
            latest_score = latest_categories.get(category, 0.0)
            baseline_score = baseline_categories.get(category, 0.0)
            
            if latest_score < 70:
                recommendations.append(
                    f"🔧 {category.capitalize()} score ({latest_score:.1f}) needs improvement. "
                    f"Review guardrails in this category and consider targeted improvements."
                )
        
        if not recommendations:
            recommendations.append("✅ All metrics are performing well. Continue monitoring and fine-tuning.")
        
        return recommendations
    
    def export_report_json(self, report: Dict[str, Any], filename: str = "final_report.json"):
        """Export report as JSON"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        return filename
    
    def export_report_markdown(self, report: Dict[str, Any], filename: str = "final_report.md"):
        """Export report as Markdown"""
        md_content = f"""# {report['report_metadata']['framework']} - Final Report

**Generated:** {report['report_metadata']['generated_at']}

---

## {report['section_1_guardrails_setup']['title']}

{report['section_1_guardrails_setup']['description']}

### Guardrails Implemented

"""
        for guardrail in report['section_1_guardrails_setup']['guardrails']:
            md_content += f"""### {guardrail['name']}
- **Purpose:** {guardrail['purpose']}
- **Implementation:** {guardrail['implementation']}
- **Metrics:** {guardrail['metrics']}

"""
        
        md_content += f"""
---

## {report['section_2_pipeline']['title']}

{report['section_2_pipeline']['description']}

### Components
"""
        for component in report['section_2_pipeline']['components']:
            md_content += f"""- **{component['component']}:** {component['description']}

"""
        
        md_content += f"""
---

## {report['section_3_baseline']['title']}

{report['section_3_baseline']['description']}

### Baseline Metrics
- **Overall Guardrail Score:** {report['section_3_baseline']['key_metrics']['overall_guardrail_score']:.2f}%
- **Completion Rate:** {report['section_3_baseline']['key_metrics']['completion_rate']:.2f}%
- **Average Turns:** {report['section_3_baseline']['key_metrics']['avg_turns']:.2f}
- **Sentiment Rate:** {report['section_3_baseline']['key_metrics']['sentiment_rate']:.2f}%

### Category Scores
"""
        for category, score in report['section_3_baseline']['key_metrics']['category_scores'].items():
            md_content += f"- **{category.capitalize()}:** {score:.2f}%\n"
        
        md_content += f"""
---

## {report['section_4_iterations']['title']}

**Total Iterations:** {report['section_4_iterations']['total_iterations']}

### Experiment Details
"""
        for i, exp in enumerate(report['section_4_iterations']['experiments'], 1):
            md_content += f"""
### Experiment {i}: {exp['experiment_id']}

**Timestamp:** {exp['timestamp']}  
**Pipeline Version:** {exp['pipeline_version']}

#### Changes Made
"""
            for change in exp['changes']:
                md_content += f"- **{change.get('category', 'Unknown')}:** {change.get('description', 'N/A')}\n"
            
            md_content += f"""
#### Performance Metrics
- Guardrail Score: {exp['performance_metrics']['guardrail_score']:.2f}%
- Completion Rate: {exp['performance_metrics']['completion_rate']:.2f}%
- Average Turns: {exp['performance_metrics']['avg_turns']:.2f}
- Sentiment Rate: {exp['performance_metrics']['sentiment_rate']:.2f}%
- Efficiency Score: {exp['performance_metrics']['efficiency_score']:.2f}%

#### Improvements vs Baseline
"""
            for metric, change in exp['improvements'].items():
                sign = "+" if change > 0 else ""
                md_content += f"- {metric}: {sign}{change:.2f}\n"
            
            if exp.get('trade_offs'):
                md_content += "\n#### Trade-offs\n"
                for tradeoff in exp['trade_offs']:
                    md_content += f"- {tradeoff}\n"
            
            if exp.get('notes'):
                md_content += f"\n#### Notes\n{exp['notes']}\n"
        
        md_content += f"""
---

## {report['section_5_analysis']['title']}

### Improvements Summary
- Positive Improvements: {report['section_5_analysis']['improvements_summary']['positive_improvements']}
- Negative Impacts: {report['section_5_analysis']['improvements_summary']['negative_impacts']}
- Neutral Changes: {report['section_5_analysis']['improvements_summary']['neutral_changes']}

### Overall Trends
"""
        if 'overall_trends' in report['section_5_analysis']:
            trends = report['section_5_analysis']['overall_trends']
            md_content += f"""
- Guardrail Score Change: {trends['baseline_to_latest']['guardrail_score_change']:+.2f}%
- Completion Rate Change: {trends['baseline_to_latest']['completion_rate_change']:+.2f}%
- Efficiency Change: {trends['baseline_to_latest']['efficiency_change']:+.2f}%

### Recommendations
"""
            for rec in trends['recommendations']:
                md_content += f"- {rec}\n"
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(md_content)
        
        return filename

