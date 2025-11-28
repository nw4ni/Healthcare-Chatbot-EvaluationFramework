from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import uvicorn
from datetime import datetime, timedelta
import re
from collections import Counter, defaultdict
import csv
import io

# Import guardrails and experiments
from guardrails import Guardrails, GuardrailMetrics
from experiments import ExperimentTracker, PipelineChange, ExperimentResult
from reporting import ReportGenerator

app = FastAPI(title="Healthcare Chatbot Analytics API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize guardrails and experiment tracker
guardrails = Guardrails()
experiment_tracker = ExperimentTracker()
report_generator = ReportGenerator()

# Pydantic models
class ChatTurn(BaseModel):
    role: str
    text: str

class ChatSession(BaseModel):
    id: str
    timestamp: str
    turns: List[ChatTurn]

class BatchRequest(BaseModel):
    chatlogs: List[ChatSession]

class AnalysisResult(BaseModel):
    id: str
    completed: bool
    turnsCount: int
    overallScore: int
    userSentiment: str
    efficiency: int
    errors: int
    oos: int
    rubricScores: Dict[str, int]
    turns: List[ChatTurn]

class BatchAnalysisResult(BaseModel):
    totalSessions: int
    successRate: int
    avgTurns: float
    sentimentRate: int
    overallScore: int
    rubricScores: Dict[str, int]
    wordFreq: Dict[str, int]
    completedSessions: int
    positiveSessions: int
    neutralSessions: int
    negativeSessions: int
    shortSessions: int
    mediumSessions: int
    longSessions: int
    sessions: List[AnalysisResult]
    # New fields for enhanced analytics
    conversionRate: Optional[float] = None
    trafficMetrics: Optional[Dict[str, Any]] = None
    reschedulingCount: Optional[int] = None
    appointmentTypes: Optional[Dict[str, int]] = None
    trendData: Optional[Dict[str, Any]] = None
    knowledgeBaseGaps: Optional[List[Dict[str, Any]]] = None
    wordCloudByTime: Optional[Dict[str, Dict[str, int]]] = None

# Analysis functions
def analyze_session(session: ChatSession) -> AnalysisResult:
    """Analyze a single chat session"""
    turns = session.turns
    is_completed = any(
        turn.role == 'bot' and 
        turn.text and 
        'confirmed' in turn.text.lower()
        for turn in turns
    )
    
    user_messages = [turn.text for turn in turns if turn.role == 'user']
    
    # Enhanced sentiment analysis
    positive_words = ['thanks', 'thank you', 'great', 'perfect', 'excellent', 'good', 
                     'wonderful', 'amazing', 'fantastic', 'awesome', 'brilliant', 
                     'superb', 'outstanding', 'delighted', 'happy', 'pleased', 
                     'satisfied', 'love', 'appreciate', 'helpful']
    negative_words = ['terrible', 'awful', 'bad', 'hate', 'angry', 'frustrated', 
                     'disappointed', 'upset', 'annoyed', 'stupid', 'ridiculous', 
                     'horrible', 'useless', 'pathetic', 'disgusting', 'annoying', 
                     'taking too long', 'system is terrible', 'this is stupid', 
                     'not working', 'broken', 'confused', 'difficult', 'problem']
    
    sentiment_score = 0
    all_user_text = ' '.join(user_messages).lower()
    
    for word in positive_words:
        if word in all_user_text:
            sentiment_score += 1
    
    for word in negative_words:
        if word in all_user_text:
            sentiment_score -= 1
    
    user_sentiment = 'neutral'
    if sentiment_score > 0:
        user_sentiment = 'positive'
    elif sentiment_score < 0:
        user_sentiment = 'negative'
    
    # Count errors and out-of-scope queries
    errors = sum(1 for turn in turns 
                if turn.role == 'user' and turn.text in ['asdf', 'xyz'])
    
    oos = sum(1 for turn in turns 
              if turn.role == 'user' and turn.text and 
              any(word in turn.text.lower() for word in ['weather', 'joke', 'pizza']))
    
    # Detect rescheduling
    is_rescheduling = any(
        turn.role == 'user' and turn.text and 
        any(word in turn.text.lower() for word in ['reschedule', 'rescheduling', 'change appointment', 'move appointment', 'cancel and reschedule'])
        for turn in turns
    )
    
    # Detect appointment type
    appointment_type = None
    specialties = ['cardiology', 'cardiac', 'heart', 'dermatology', 'skin', 'pediatrics', 'pediatric', 'child', 'orthopedics', 'orthopedic', 'bone', 'ent', 'ear', 'nose', 'throat', 'general', 'primary', 'flu', 'covid', 'vaccine', 'checkup', 'physical']
    all_text = ' '.join([turn.text.lower() for turn in turns if turn.text])
    for specialty in specialties:
        if specialty in all_text:
            appointment_type = specialty
            break
    
    # Calculate rubric scores
    rubric_scores = {
        'satisfaction': 100 if is_completed else 0,
        'coherence': 100 if len(turns) <= 8 else 80,
        'relevance': 90,
        'consistency': 85,
        'adaptability': 80,
        'memory': 75,
        'efficiency': max(0, 100 - (len(turns) - 4) * 10)
    }
    
    overall_score = round(sum(rubric_scores.values()) / len(rubric_scores))
    efficiency = max(0, 100 - (len(turns) - 4) * 10)
    
    return AnalysisResult(
        id=session.id,
        completed=is_completed,
        turnsCount=len(turns),
        overallScore=overall_score,
        userSentiment=user_sentiment,
        efficiency=efficiency,
        errors=errors,
        oos=oos,
        rubricScores=rubric_scores,
        turns=turns
    )

def analyze_batch_data(chatlogs: List[ChatSession]) -> BatchAnalysisResult:
    """Analyze multiple chat sessions with enhanced metrics"""
    total_sessions = len(chatlogs)
    completed_sessions = 0
    total_turns = 0
    positive_sessions = 0
    neutral_sessions = 0
    negative_sessions = 0
    total_score = 0
    short_sessions = 0  # 1-4 turns
    medium_sessions = 0  # 5-8 turns
    long_sessions = 0  # 9+ turns
    word_freq = Counter()
    rubric_scores = {
        'satisfaction': 0,
        'coherence': 0,
        'relevance': 0,
        'consistency': 0,
        'adaptability': 0,
        'memory': 0,
        'efficiency': 0
    }
    
    # New metrics tracking
    rescheduling_count = 0
    appointment_types = Counter()
    knowledge_base_gaps = []
    word_cloud_by_time = defaultdict(Counter)  # Group by month
    trend_data_by_date = defaultdict(lambda: {'sessions': 0, 'completed': 0, 'conversion': 0.0})
    
    sessions = []
    
    for session in chatlogs:
        analysis = analyze_session(session)
        sessions.append(analysis)
        
        if analysis.completed:
            completed_sessions += 1
        total_turns += analysis.turnsCount
        
        # Count sentiment sessions
        if analysis.userSentiment == 'positive':
            positive_sessions += 1
        elif analysis.userSentiment == 'neutral':
            neutral_sessions += 1
        elif analysis.userSentiment == 'negative':
            negative_sessions += 1
        
        # Count duration sessions
        if analysis.turnsCount <= 4:
            short_sessions += 1
        elif analysis.turnsCount <= 8:
            medium_sessions += 1
        else:
            long_sessions += 1
        
        total_score += analysis.overallScore
        
        # Detect rescheduling
        session_text = ' '.join([turn.text.lower() for turn in session.turns if turn.text])
        if any(word in session_text for word in ['reschedule', 'rescheduling', 'change appointment', 'move appointment', 'cancel and reschedule']):
            rescheduling_count += 1
        
        # Detect appointment types
        specialties = ['cardiology', 'cardiac', 'heart', 'dermatology', 'skin', 'pediatrics', 'pediatric', 'child', 
                      'orthopedics', 'orthopedic', 'bone', 'ent', 'ear', 'nose', 'throat', 'general', 'primary', 
                      'flu', 'covid', 'vaccine', 'checkup', 'physical', 'dental', 'eye', 'vision', 'mental', 'therapy']
        for specialty in specialties:
            if specialty in session_text:
                appointment_types[specialty] += 1
                break
        
        # Track out-of-scope queries for knowledge base gaps
        for turn in session.turns:
            if turn.role == 'user' and turn.text:
                # Detect out-of-scope queries
                oos_keywords = ['weather', 'joke', 'pizza', 'recipe', 'sports', 'news', 'stock', 'movie']
                if any(keyword in turn.text.lower() for keyword in oos_keywords):
                    knowledge_base_gaps.append({
                        'query': turn.text,
                        'session_id': session.id,
                        'timestamp': session.timestamp,
                        'suggested_topic': 'General information queries'
                    })
        
        # Word frequency analysis with time grouping
        try:
            session_date = datetime.fromisoformat(session.timestamp.replace('Z', '+00:00'))
            month_key = session_date.strftime('%Y-%m')
        except:
            month_key = 'unknown'
        
        for turn in session.turns:
            if turn.role == 'user' and turn.text:
                words = re.findall(r'\b\w+\b', turn.text.lower())
                for word in words:
                    if (len(word) > 2 and 
                        word not in ['the', 'and', 'you', 'for', 'are', 'with', 
                                   'this', 'that', 'have', 'from', 'can', 'will', 
                                   'would', 'could', 'should', 'please', 'thank', 'thanks']):
                        word_freq[word] += 1
                        word_cloud_by_time[month_key][word] += 1
        
        # Trend data by date
        try:
            session_date = datetime.fromisoformat(session.timestamp.replace('Z', '+00:00'))
            date_key = session_date.strftime('%Y-%m-%d')
            trend_data_by_date[date_key]['sessions'] += 1
            if analysis.completed:
                trend_data_by_date[date_key]['completed'] += 1
        except:
            pass
        
        # Accumulate rubric scores
        for key in rubric_scores:
            rubric_scores[key] += analysis.rubricScores[key]
    
    # Calculate averages
    for key in rubric_scores:
        rubric_scores[key] = round(rubric_scores[key] / total_sessions)
    
    # Calculate conversion rate (same as success rate but as float)
    conversion_rate = round((completed_sessions / total_sessions) * 100, 2) if total_sessions > 0 else 0.0
    
    # Traffic metrics
    traffic_metrics = {
        'totalChats': total_sessions,
        'uniqueUsers': total_sessions,  # Assuming 1:1 for now, can be enhanced
        'avgSessionDuration': round(total_turns / total_sessions, 1) if total_sessions > 0 else 0,
        'peakHour': 'N/A',  # Can be enhanced with timestamp analysis
        'bounceRate': round(((total_sessions - completed_sessions) / total_sessions) * 100, 2) if total_sessions > 0 else 0
    }
    
    # Process trend data
    trend_data = {
        'dates': sorted(trend_data_by_date.keys()),
        'sessions': [trend_data_by_date[date]['sessions'] for date in sorted(trend_data_by_date.keys())],
        'completed': [trend_data_by_date[date]['completed'] for date in sorted(trend_data_by_date.keys())],
        'conversionRates': [
            round((trend_data_by_date[date]['completed'] / trend_data_by_date[date]['sessions']) * 100, 2) 
            if trend_data_by_date[date]['sessions'] > 0 else 0
            for date in sorted(trend_data_by_date.keys())
        ]
    }
    
    # Convert word cloud by time to dict
    word_cloud_by_time_dict = {month: dict(counter) for month, counter in word_cloud_by_time.items()}
    
    return BatchAnalysisResult(
        totalSessions=total_sessions,
        successRate=round((completed_sessions / total_sessions) * 100),
        avgTurns=round(total_turns / total_sessions, 1),
        sentimentRate=round((positive_sessions / total_sessions) * 100),
        overallScore=round(total_score / total_sessions),
        rubricScores=rubric_scores,
        wordFreq=dict(word_freq),
        completedSessions=completed_sessions,
        positiveSessions=positive_sessions,
        neutralSessions=neutral_sessions,
        negativeSessions=negative_sessions,
        shortSessions=short_sessions,
        mediumSessions=medium_sessions,
        longSessions=long_sessions,
        sessions=sessions,
        conversionRate=conversion_rate,
        trafficMetrics=traffic_metrics,
        reschedulingCount=rescheduling_count,
        appointmentTypes=dict(appointment_types),
        trendData=trend_data,
        knowledgeBaseGaps=knowledge_base_gaps[:20],  # Top 20 gaps
        wordCloudByTime=word_cloud_by_time_dict
    )

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Healthcare Chatbot Analytics API", "version": "1.0.0"}

@app.post("/evaluate", response_model=AnalysisResult)
async def evaluate_single_session(session: ChatSession):
    """Evaluate a single chat session"""
    try:
        result = analyze_session(session)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/evaluate_json")
async def evaluate_single_json(session_data: dict):
    """Evaluate a single session from JSON data"""
    try:
        session = ChatSession(**session_data)
        result = analyze_session(session)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/batch", response_model=BatchAnalysisResult)
async def evaluate_batch(batch_request: BatchRequest):
    """Evaluate multiple chat sessions"""
    try:
        result = analyze_batch_data(batch_request.chatlogs)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/batch_json")
async def evaluate_batch_json(batch_data: dict):
    """Evaluate batch from JSON data"""
    try:
        if isinstance(batch_data, list):
            chatlogs = [ChatSession(**session) for session in batch_data]
        else:
            chatlogs = [ChatSession(**session) for session in batch_data.get('chatlogs', [])]
        
        result = analyze_batch_data(chatlogs)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload and analyze a JSON file"""
    try:
        content = await file.read()
        data = json.loads(content.decode('utf-8'))
        
        if isinstance(data, list):
            chatlogs = [ChatSession(**session) for session in data]
        else:
            chatlogs = [ChatSession(**session) for session in data.get('chatlogs', [])]
        
        result = analyze_batch_data(chatlogs)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@app.post("/export/powerbi")
async def export_powerbi(batch_data: dict):
    """Export data in CSV format for PowerBI"""
    try:
        if isinstance(batch_data, list):
            chatlogs = [ChatSession(**session) for session in batch_data]
        else:
            chatlogs = [ChatSession(**session) for session in batch_data.get('chatlogs', [])]
        
        result = analyze_batch_data(chatlogs)
        
        # Create CSV data
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write summary metrics
        writer.writerow(['Metric', 'Value'])
        writer.writerow(['Total Sessions', result.totalSessions])
        writer.writerow(['Success Rate (%)', result.successRate])
        writer.writerow(['Conversion Rate (%)', result.conversionRate])
        writer.writerow(['Avg Turns', result.avgTurns])
        writer.writerow(['Positive Sentiment Rate (%)', result.sentimentRate])
        writer.writerow(['Rescheduling Count', result.reschedulingCount])
        writer.writerow(['Completed Sessions', result.completedSessions])
        writer.writerow(['Abandoned Sessions', result.totalSessions - result.completedSessions])
        writer.writerow([])
        
        # Write rubric scores
        writer.writerow(['Rubric', 'Score'])
        for rubric, score in result.rubricScores.items():
            writer.writerow([rubric.capitalize(), score])
        writer.writerow([])
        
        # Write appointment types
        writer.writerow(['Appointment Type', 'Count'])
        for apt_type, count in result.appointmentTypes.items():
            writer.writerow([apt_type, count])
        writer.writerow([])
        
        # Write session-level data
        writer.writerow(['Session ID', 'Completed', 'Turns', 'Score', 'Sentiment', 'Efficiency', 'Errors', 'OOS'])
        for session in result.sessions:
            writer.writerow([
                session.id,
                session.completed,
                session.turnsCount,
                session.overallScore,
                session.userSentiment,
                session.efficiency,
                session.errors,
                session.oos
            ])
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=chatbot_analytics.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error exporting data: {str(e)}")

@app.get("/metrics/config")
async def get_metrics_config():
    """Get available metrics configuration"""
    return {
        "availableMetrics": [
            {
                "id": "conversion_rate",
                "name": "Conversion Rate",
                "description": "Percentage of sessions that successfully completed appointment booking",
                "type": "percentage"
            },
            {
                "id": "traffic_volume",
                "name": "Traffic Volume",
                "description": "Total number of chat sessions",
                "type": "count"
            },
            {
                "id": "avg_turns",
                "name": "Average Turns",
                "description": "Average number of conversation turns per session",
                "type": "number"
            },
            {
                "id": "sentiment_rate",
                "name": "Positive Sentiment Rate",
                "description": "Percentage of sessions with positive user sentiment",
                "type": "percentage"
            },
            {
                "id": "rescheduling_rate",
                "name": "Rescheduling Rate",
                "description": "Percentage of sessions involving appointment rescheduling",
                "type": "percentage"
            },
            {
                "id": "appointment_types",
                "name": "Appointment Types",
                "description": "Distribution of appointment types requested",
                "type": "distribution"
            }
        ]
    }

# Guardrails endpoints
@app.post("/guardrails/evaluate")
async def evaluate_guardrails(session: ChatSession):
    """Evaluate guardrails for a single session"""
    try:
        turns = [{"role": turn.role, "text": turn.text} for turn in session.turns]
        is_completed = any(
            turn.role == 'bot' and turn.text and 'confirmed' in turn.text.lower()
            for turn in session.turns
        )
        metrics = guardrails.evaluate_session(turns, is_completed)
        return metrics.dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/guardrails/evaluate_batch")
async def evaluate_guardrails_batch(batch_request: dict):
    """Evaluate guardrails for a batch of sessions"""
    try:
        # Handle both BatchRequest format and raw dict format
        if isinstance(batch_request, dict):
            if "chatlogs" in batch_request:
                chatlogs = batch_request["chatlogs"]
            elif isinstance(batch_request, list):
                chatlogs = batch_request
            else:
                chatlogs = batch_request
        else:
            # Try to get chatlogs attribute
            chatlogs = getattr(batch_request, "chatlogs", batch_request)
        
        if not isinstance(chatlogs, list):
            raise HTTPException(status_code=400, detail="chatlogs must be a list")
        
        if len(chatlogs) == 0:
            raise HTTPException(status_code=400, detail="chatlogs list is empty")
        
        # Convert to the format guardrails expects
        sessions = []
        for session in chatlogs:
            if isinstance(session, dict):
                session_id = session.get("id", f"session_{len(sessions)}")
                turns = session.get("turns", [])
                # Convert turns to dict format if needed
                turns_dict = []
                for turn in turns:
                    if isinstance(turn, dict):
                        turns_dict.append({
                            "role": turn.get("role", ""), 
                            "text": turn.get("text", "")
                        })
                    else:
                        # Handle ChatTurn object
                        turns_dict.append({"role": turn.role, "text": turn.text})
                sessions.append({"id": session_id, "turns": turns_dict})
            else:
                # Handle ChatSession object
                sessions.append({
                    "id": session.id, 
                    "turns": [{"role": turn.role, "text": turn.text} for turn in session.turns]
                })
        
        result = guardrails.evaluate_batch(sessions)
        return result
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Error evaluating guardrails: {str(e)}"
        print(f"Guardrails batch error: {error_detail}")
        print(traceback.format_exc())
        raise HTTPException(status_code=400, detail=error_detail)

# Experiment endpoints
@app.post("/experiments/baseline")
async def set_baseline(baseline_data: dict):
    """Set baseline performance measurement"""
    try:
        # Extract data from request
        pipeline_version = baseline_data.get("pipeline_version", "v1.0.0")
        changes = [PipelineChange(**c) for c in baseline_data.get("changes", [])]
        guardrail_scores = baseline_data.get("guardrail_scores", {})
        overall_guardrail_score = baseline_data.get("overall_guardrail_score", 0.0)
        completion_rate = baseline_data.get("completion_rate", 0.0)
        avg_turns = baseline_data.get("avg_turns", 0.0)
        sentiment_rate = baseline_data.get("sentiment_rate", 0.0)
        efficiency_score = baseline_data.get("efficiency_score", 0.0)
        session_count = baseline_data.get("session_count", 0)
        notes = baseline_data.get("notes")
        
        experiment = experiment_tracker.create_experiment(
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
        
        experiment_tracker.set_baseline(experiment)
        return {"message": "Baseline set successfully", "experiment": experiment.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/experiments/create")
async def create_experiment(experiment_data: dict):
    """Create a new experiment/iteration"""
    try:
        pipeline_version = experiment_data.get("pipeline_version", "v1.0.0")
        changes = [PipelineChange(**c) for c in experiment_data.get("changes", [])]
        guardrail_scores = experiment_data.get("guardrail_scores", {})
        overall_guardrail_score = experiment_data.get("overall_guardrail_score", 0.0)
        completion_rate = experiment_data.get("completion_rate", 0.0)
        avg_turns = experiment_data.get("avg_turns", 0.0)
        sentiment_rate = experiment_data.get("sentiment_rate", 0.0)
        efficiency_score = experiment_data.get("efficiency_score", 0.0)
        session_count = experiment_data.get("session_count", 0)
        notes = experiment_data.get("notes")
        trade_offs = experiment_data.get("trade_offs", [])
        
        experiment = experiment_tracker.create_experiment(
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
        
        # Add trade-offs if provided
        if trade_offs:
            experiment.trade_offs = trade_offs
            experiment_tracker.save_experiments()
        
        return {"message": "Experiment created successfully", "experiment": experiment.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/experiments/list")
async def list_experiments():
    """Get all experiments"""
    try:
        experiments = experiment_tracker.get_all_experiments()
        baseline = experiment_tracker.get_baseline()
        return {
            "baseline": baseline.dict() if baseline else None,
            "experiments": [exp.dict() for exp in experiments]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/experiments/{experiment_id}")
async def get_experiment(experiment_id: str):
    """Get a specific experiment"""
    try:
        experiment = experiment_tracker.get_experiment(experiment_id)
        if not experiment:
            raise HTTPException(status_code=404, detail="Experiment not found")
        return experiment.dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/experiments/report")
async def get_experiment_report():
    """Generate experiment report"""
    try:
        report = experiment_tracker.generate_report()
        return report
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Reporting endpoints
@app.post("/reports/generate")
async def generate_final_report(report_data: dict):
    """Generate final comprehensive report"""
    try:
        guardrails_config = report_data.get("guardrails_config", {})
        baseline_experiment = report_data.get("baseline_experiment", {})
        experiments = report_data.get("experiments", [])
        pipeline_description = report_data.get("pipeline_description", "Healthcare Chatbot Pipeline")
        
        report = report_generator.generate_final_report(
            guardrails_config=guardrails_config,
            baseline_experiment=baseline_experiment,
            experiments=experiments,
            pipeline_description=pipeline_description
        )
        
        return report
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/reports/export_json")
async def export_report_json(report_data: dict):
    """Export report as JSON file"""
    try:
        filename = report_generator.export_report_json(report_data, "final_report.json")
        return {"message": "Report exported successfully", "filename": filename}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/reports/export_markdown")
async def export_report_markdown(report_data: dict):
    """Export report as Markdown file"""
    try:
        filename = report_generator.export_report_markdown(report_data, "final_report.md")
        return {"message": "Report exported successfully", "filename": filename}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

