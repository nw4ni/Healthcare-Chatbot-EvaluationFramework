"""
Experimentation Framework
Tracks A/B tests, pipeline changes, and their impact on performance
"""
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import json

class PipelineChange(BaseModel):
    """Represents a change made to the pipeline"""
    change_id: str
    timestamp: str
    description: str
    category: str  # e.g., "prompt_engineering", "guardrails", "response_format", "knowledge_base"
    details: Dict[str, Any] = {}
    expected_impact: Optional[str] = None

class ExperimentResult(BaseModel):
    """Results of an experiment/iteration"""
    experiment_id: str
    baseline_id: Optional[str] = None  # Reference to baseline experiment
    timestamp: str
    pipeline_version: str
    changes: List[PipelineChange] = []
    
    # Performance metrics
    guardrail_scores: Dict[str, float] = {}  # Category scores
    overall_guardrail_score: float = 0.0
    completion_rate: float = 0.0
    avg_turns: float = 0.0
    sentiment_rate: float = 0.0
    efficiency_score: float = 0.0
    
    # Comparison with baseline
    improvement: Dict[str, float] = {}  # e.g., {"completion_rate": +5.2, "guardrail_score": -2.1}
    trade_offs: List[str] = []  # Documented trade-offs
    
    # Metadata
    notes: Optional[str] = None
    session_count: int = 0

class ExperimentTracker:
    """
    Tracks experiments, iterations, and their impact on performance
    """
    
    def __init__(self, storage_file: str = "experiments.json"):
        self.storage_file = storage_file
        self.experiments: List[ExperimentResult] = []
        self.baseline: Optional[ExperimentResult] = None
        self.load_experiments()
    
    def load_experiments(self):
        """Load experiments from storage"""
        try:
            with open(self.storage_file, 'r') as f:
                data = json.load(f)
                self.experiments = [ExperimentResult(**exp) for exp in data.get('experiments', [])]
                if data.get('baseline'):
                    self.baseline = ExperimentResult(**data['baseline'])
        except FileNotFoundError:
            self.experiments = []
            self.baseline = None
    
    def save_experiments(self):
        """Save experiments to storage"""
        data = {
            'experiments': [exp.dict() for exp in self.experiments],
            'baseline': self.baseline.dict() if self.baseline else None
        }
        with open(self.storage_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def set_baseline(self, experiment: ExperimentResult):
        """Set baseline performance"""
        self.baseline = experiment
        self.save_experiments()
    
    def create_experiment(
        self,
        pipeline_version: str,
        changes: List[PipelineChange],
        guardrail_scores: Dict[str, float],
        overall_guardrail_score: float,
        completion_rate: float,
        avg_turns: float,
        sentiment_rate: float,
        efficiency_score: float,
        session_count: int,
        notes: Optional[str] = None
    ) -> ExperimentResult:
        """Create a new experiment result"""
        experiment_id = f"exp_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        experiment = ExperimentResult(
            experiment_id=experiment_id,
            baseline_id=self.baseline.experiment_id if self.baseline else None,
            timestamp=datetime.now().isoformat(),
            pipeline_version=pipeline_version,
            changes=changes,
            guardrail_scores=guardrail_scores,
            overall_guardrail_score=overall_guardrail_score,
            completion_rate=completion_rate,
            avg_turns=avg_turns,
            sentiment_rate=sentiment_rate,
            efficiency_score=efficiency_score,
            session_count=session_count,
            notes=notes
        )
        
        # Calculate improvements compared to baseline
        if self.baseline:
            experiment.improvement = {
                "guardrail_score": experiment.overall_guardrail_score - self.baseline.overall_guardrail_score,
                "completion_rate": experiment.completion_rate - self.baseline.completion_rate,
                "avg_turns": experiment.avg_turns - self.baseline.avg_turns,
                "sentiment_rate": experiment.sentiment_rate - self.baseline.sentiment_rate,
                "efficiency_score": experiment.efficiency_score - self.baseline.efficiency_score
            }
            
            # Calculate category improvements
            for category in guardrail_scores.keys():
                baseline_score = self.baseline.guardrail_scores.get(category, 0.0)
                current_score = guardrail_scores.get(category, 0.0)
                experiment.improvement[f"guardrail_{category}"] = current_score - baseline_score
        
        self.experiments.append(experiment)
        self.save_experiments()
        
        return experiment
    
    def get_experiment(self, experiment_id: str) -> Optional[ExperimentResult]:
        """Get a specific experiment"""
        for exp in self.experiments:
            if exp.experiment_id == experiment_id:
                return exp
        return None
    
    def get_all_experiments(self) -> List[ExperimentResult]:
        """Get all experiments"""
        return self.experiments
    
    def get_baseline(self) -> Optional[ExperimentResult]:
        """Get baseline experiment"""
        return self.baseline
    
    def compare_experiments(self, exp1_id: str, exp2_id: str) -> Dict[str, Any]:
        """Compare two experiments"""
        exp1 = self.get_experiment(exp1_id)
        exp2 = self.get_experiment(exp2_id)
        
        if not exp1 or not exp2:
            return {"error": "One or both experiments not found"}
        
        comparison = {
            "experiment_1": exp1.experiment_id,
            "experiment_2": exp2.experiment_id,
            "differences": {
                "guardrail_score": exp2.overall_guardrail_score - exp1.overall_guardrail_score,
                "completion_rate": exp2.completion_rate - exp1.completion_rate,
                "avg_turns": exp2.avg_turns - exp1.avg_turns,
                "sentiment_rate": exp2.sentiment_rate - exp1.sentiment_rate,
                "efficiency_score": exp2.efficiency_score - exp1.efficiency_score
            },
            "category_differences": {}
        }
        
        for category in exp2.guardrail_scores.keys():
            score1 = exp1.guardrail_scores.get(category, 0.0)
            score2 = exp2.guardrail_scores.get(category, 0.0)
            comparison["category_differences"][category] = score2 - score1
        
        return comparison
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive experiment report"""
        if not self.baseline:
            return {"error": "No baseline set"}
        
        report = {
            "baseline": self.baseline.dict(),
            "total_experiments": len(self.experiments),
            "experiments": [],
            "summary": {
                "best_guardrail_score": None,
                "best_completion_rate": None,
                "best_efficiency": None,
                "most_improvements": None
            }
        }
        
        best_guardrail = None
        best_completion = None
        best_efficiency = None
        most_improvements = None
        max_improvements = 0
        
        for exp in self.experiments:
            exp_dict = exp.dict()
            
            # Track best performers
            if not best_guardrail or exp.overall_guardrail_score > best_guardrail.overall_guardrail_score:
                best_guardrail = exp
            
            if not best_completion or exp.completion_rate > best_completion.completion_rate:
                best_completion = exp
            
            if not best_efficiency or exp.efficiency_score > best_efficiency.efficiency_score:
                best_efficiency = exp
            
            positive_improvements = sum(1 for v in exp.improvement.values() if v > 0)
            if positive_improvements > max_improvements:
                max_improvements = positive_improvements
                most_improvements = exp
            
            report["experiments"].append(exp_dict)
        
        report["summary"]["best_guardrail_score"] = best_guardrail.experiment_id if best_guardrail else None
        report["summary"]["best_completion_rate"] = best_completion.experiment_id if best_completion else None
        report["summary"]["best_efficiency"] = best_efficiency.experiment_id if best_efficiency else None
        report["summary"]["most_improvements"] = most_improvements.experiment_id if most_improvements else None
        
        return report

