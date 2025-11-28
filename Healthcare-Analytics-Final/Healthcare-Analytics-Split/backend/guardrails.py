"""
LLM Guardrails Module
Measures different parts of the workflow to ensure quality and safety
"""
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import re

class GuardrailResult(BaseModel):
    """Result of a single guardrail check"""
    name: str
    passed: bool
    score: float  # 0-100
    message: str
    details: Dict[str, Any] = {}

class GuardrailMetrics(BaseModel):
    """Aggregated guardrail metrics for a session or batch"""
    timestamp: str
    session_id: Optional[str] = None
    total_guardrails: int = 0
    passed_count: int = 0
    failed_count: int = 0
    overall_score: float = 0.0
    guardrail_results: List[GuardrailResult] = []
    category_scores: Dict[str, float] = {}  # e.g., {"safety": 95.0, "accuracy": 87.5}

class Guardrails:
    """
    LLM Guardrails System
    Measures different aspects of the chatbot workflow:
    - Safety: Harmful content, PII detection
    - Accuracy: Factual correctness, medical accuracy
    - Relevance: Response relevance to query
    - Coherence: Logical flow and consistency
    - Completeness: Information completeness
    - Efficiency: Response time and turn count
    """
    
    def __init__(self):
        # Safety keywords
        self.harmful_keywords = [
            'suicide', 'kill myself', 'end my life', 'harm', 'violence',
            'illegal', 'prescription without', 'drug abuse'
        ]
        
        # PII patterns
        self.pii_patterns = {
            'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
            'phone': r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'credit_card': r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b'
        }
        
        # Medical accuracy indicators
        self.medical_accuracy_indicators = {
            'positive': ['doctor', 'specialist', 'appointment', 'medical', 'health', 'symptoms'],
            'negative': ['cure', 'guarantee', 'definitely', 'always works', 'miracle']
        }
    
    def check_safety(self, turns: List[Dict]) -> GuardrailResult:
        """Check for harmful content and safety violations"""
        all_text = ' '.join([turn.get('text', '') for turn in turns]).lower()
        
        harmful_detected = []
        for keyword in self.harmful_keywords:
            if keyword in all_text:
                harmful_detected.append(keyword)
        
        passed = len(harmful_detected) == 0
        score = 100.0 if passed else max(0, 100 - (len(harmful_detected) * 20))
        
        return GuardrailResult(
            name="Safety Check",
            passed=passed,
            score=score,
            message="No harmful content detected" if passed else f"Detected potentially harmful keywords: {', '.join(harmful_detected)}",
            details={"harmful_keywords": harmful_detected}
        )
    
    def check_pii_protection(self, turns: List[Dict]) -> GuardrailResult:
        """Check for PII leakage in bot responses"""
        bot_messages = [turn.get('text', '') for turn in turns if turn.get('role') == 'bot']
        all_bot_text = ' '.join(bot_messages)
        
        pii_detected = {}
        for pii_type, pattern in self.pii_patterns.items():
            matches = re.findall(pattern, all_bot_text)
            if matches:
                pii_detected[pii_type] = len(matches)
        
        passed = len(pii_detected) == 0
        score = 100.0 if passed else max(0, 100 - (sum(pii_detected.values()) * 15))
        
        return GuardrailResult(
            name="PII Protection",
            passed=passed,
            score=score,
            message="No PII detected in bot responses" if passed else f"PII detected: {', '.join(pii_detected.keys())}",
            details={"pii_detected": pii_detected}
        )
    
    def check_medical_accuracy(self, turns: List[Dict]) -> GuardrailResult:
        """Check for medical accuracy and appropriate language"""
        bot_messages = [turn.get('text', '').lower() for turn in turns if turn.get('role') == 'bot']
        all_bot_text = ' '.join(bot_messages)
        
        positive_indicators = sum(1 for indicator in self.medical_accuracy_indicators['positive'] 
                                 if indicator in all_bot_text)
        negative_indicators = sum(1 for indicator in self.medical_accuracy_indicators['negative'] 
                                 if indicator in all_bot_text)
        
        # Check for appropriate medical language
        has_medical_context = any(ind in all_bot_text for ind in ['appointment', 'doctor', 'specialist', 'medical'])
        avoids_guarantees = negative_indicators == 0
        
        score = 0.0
        if has_medical_context:
            score += 50
        if avoids_guarantees:
            score += 30
        if positive_indicators > 0:
            score += min(20, positive_indicators * 5)
        
        passed = score >= 70
        
        return GuardrailResult(
            name="Medical Accuracy",
            passed=passed,
            score=score,
            message="Medical language is appropriate" if passed else "Medical language needs improvement",
            details={
                "positive_indicators": positive_indicators,
                "negative_indicators": negative_indicators,
                "has_medical_context": has_medical_context
            }
        )
    
    def check_relevance(self, turns: List[Dict]) -> GuardrailResult:
        """Check if bot responses are relevant to user queries"""
        if len(turns) < 2:
            return GuardrailResult(
                name="Relevance Check",
                passed=False,
                score=0.0,
                message="Insufficient conversation data",
                details={}
            )
        
        relevance_scores = []
        user_turns = [turn for turn in turns if turn.get('role') == 'user']
        bot_turns = [turn for turn in turns if turn.get('role') == 'bot']
        
        # Simple keyword overlap check
        for i in range(min(len(user_turns), len(bot_turns))):
            user_text = set(user_turns[i].get('text', '').lower().split())
            bot_text = set(bot_turns[i].get('text', '').lower().split())
            
            # Remove common words
            common_words = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 
                          'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 
                          'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those'}
            user_text = user_text - common_words
            bot_text = bot_text - common_words
            
            if len(user_text) > 0:
                overlap = len(user_text & bot_text) / len(user_text)
                relevance_scores.append(overlap * 100)
        
        avg_score = sum(relevance_scores) / len(relevance_scores) if relevance_scores else 0.0
        passed = avg_score >= 50
        
        return GuardrailResult(
            name="Relevance Check",
            passed=passed,
            score=avg_score,
            message=f"Average relevance: {avg_score:.1f}%" if passed else "Low relevance detected",
            details={"relevance_scores": relevance_scores, "average": avg_score}
        )
    
    def check_coherence(self, turns: List[Dict]) -> GuardrailResult:
        """Check for logical flow and consistency"""
        if len(turns) < 2:
            return GuardrailResult(
                name="Coherence Check",
                passed=False,
                score=0.0,
                message="Insufficient conversation data",
                details={}
            )
        
        # Check for topic consistency
        topics = []
        for turn in turns:
            text = turn.get('text', '').lower()
            if 'appointment' in text or 'book' in text:
                topics.append('booking')
            elif 'reschedule' in text or 'change' in text:
                topics.append('rescheduling')
            elif 'cancel' in text:
                topics.append('cancellation')
            else:
                topics.append('other')
        
        # Coherence: similar topics should be grouped
        topic_changes = sum(1 for i in range(1, len(topics)) if topics[i] != topics[i-1])
        coherence_score = max(0, 100 - (topic_changes * 10))
        
        # Check for contradictions (simple check)
        bot_messages = [turn.get('text', '').lower() for turn in turns if turn.get('role') == 'bot']
        has_contradiction = False
        if len(bot_messages) > 1:
            # Simple contradiction detection
            if any('yes' in msg and 'no' in bot_messages[i+1] for i, msg in enumerate(bot_messages[:-1])):
                has_contradiction = True
                coherence_score -= 20
        
        passed = coherence_score >= 70
        
        return GuardrailResult(
            name="Coherence Check",
            passed=passed,
            score=max(0, coherence_score),
            message="Conversation flows logically" if passed else "Coherence issues detected",
            details={"topic_changes": topic_changes, "has_contradiction": has_contradiction}
        )
    
    def check_completeness(self, turns: List[Dict]) -> GuardrailResult:
        """Check if bot provides complete information"""
        bot_messages = [turn.get('text', '').lower() for turn in turns if turn.get('role') == 'bot']
        all_bot_text = ' '.join(bot_messages)
        
        # Check for key information elements
        completeness_indicators = {
            'greeting': ['hello', 'hi', 'welcome', 'help'],
            'confirmation': ['confirm', 'confirmed', 'scheduled', 'appointment'],
            'details': ['date', 'time', 'doctor', 'location', 'specialty'],
            'next_steps': ['email', 'confirmation', 'reminder', 'contact']
        }
        
        scores = {}
        for indicator, keywords in completeness_indicators.items():
            scores[indicator] = any(keyword in all_bot_text for keyword in keywords)
        
        completeness_score = (sum(scores.values()) / len(scores)) * 100
        passed = completeness_score >= 60
        
        return GuardrailResult(
            name="Completeness Check",
            passed=passed,
            score=completeness_score,
            message="Bot provides complete information" if passed else "Information completeness could be improved",
            details={"indicators": scores}
        )
    
    def check_efficiency(self, turns: List[Dict], is_completed: bool) -> GuardrailResult:
        """Check conversation efficiency"""
        turn_count = len(turns)
        
        # Ideal: 4-6 turns for completed sessions
        if is_completed:
            if turn_count <= 4:
                efficiency_score = 100
            elif turn_count <= 6:
                efficiency_score = 90
            elif turn_count <= 8:
                efficiency_score = 75
            else:
                efficiency_score = max(0, 100 - (turn_count - 8) * 5)
        else:
            # For incomplete sessions, efficiency is lower
            efficiency_score = max(0, 100 - (turn_count * 10))
        
        passed = efficiency_score >= 70
        
        return GuardrailResult(
            name="Efficiency Check",
            passed=passed,
            score=efficiency_score,
            message=f"Efficiency score: {efficiency_score:.1f}% ({turn_count} turns)" if passed else "Conversation could be more efficient",
            details={"turn_count": turn_count, "is_completed": is_completed}
        )
    
    def evaluate_session(self, turns: List[Dict], is_completed: bool) -> GuardrailMetrics:
        """Run all guardrails on a session"""
        guardrail_results = [
            self.check_safety(turns),
            self.check_pii_protection(turns),
            self.check_medical_accuracy(turns),
            self.check_relevance(turns),
            self.check_coherence(turns),
            self.check_completeness(turns),
            self.check_efficiency(turns, is_completed)
        ]
        
        passed_count = sum(1 for result in guardrail_results if result.passed)
        failed_count = len(guardrail_results) - passed_count
        overall_score = sum(result.score for result in guardrail_results) / len(guardrail_results)
        
        # Category scores
        category_scores = {
            "safety": (guardrail_results[0].score + guardrail_results[1].score) / 2,
            "accuracy": guardrail_results[2].score,
            "quality": (guardrail_results[3].score + guardrail_results[4].score + guardrail_results[5].score) / 3,
            "efficiency": guardrail_results[6].score
        }
        
        return GuardrailMetrics(
            timestamp=datetime.now().isoformat(),
            total_guardrails=len(guardrail_results),
            passed_count=passed_count,
            failed_count=failed_count,
            overall_score=overall_score,
            guardrail_results=guardrail_results,
            category_scores=category_scores
        )
    
    def evaluate_batch(self, sessions: List[Dict]) -> Dict[str, Any]:
        """Evaluate guardrails for a batch of sessions"""
        all_metrics = []
        category_totals = {
            "safety": [],
            "accuracy": [],
            "quality": [],
            "efficiency": []
        }
        
        for session in sessions:
            turns = session.get('turns', [])
            is_completed = any(
                turn.get('role') == 'bot' and 
                turn.get('text', '').lower().find('confirmed') != -1
                for turn in turns
            )
            
            metrics = self.evaluate_session(turns, is_completed)
            metrics.session_id = session.get('id', 'unknown')
            all_metrics.append(metrics)
            
            # Aggregate category scores
            for category, score in metrics.category_scores.items():
                category_totals[category].append(score)
        
        # Calculate batch averages
        batch_category_scores = {
            category: sum(scores) / len(scores) if scores else 0.0
            for category, scores in category_totals.items()
        }
        
        overall_batch_score = sum(metrics.overall_score for metrics in all_metrics) / len(all_metrics) if all_metrics else 0.0
        
        return {
            "batch_metrics": {
                "total_sessions": len(sessions),
                "overall_score": overall_batch_score,
                "category_scores": batch_category_scores,
                "passed_rate": sum(1 for m in all_metrics if m.passed_count >= m.total_guardrails * 0.7) / len(all_metrics) * 100 if all_metrics else 0.0
            },
            "session_metrics": [metrics.dict() for metrics in all_metrics]
        }

