from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import uvicorn
from datetime import datetime
import re
from collections import Counter

app = FastAPI(title="Healthcare Chatbot Analytics API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    """Analyze multiple chat sessions"""
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
        
        # Word frequency analysis
        for turn in session.turns:
            if turn.role == 'user' and turn.text:
                words = re.findall(r'\b\w+\b', turn.text.lower())
                for word in words:
                    if (len(word) > 2 and 
                        word not in ['the', 'and', 'you', 'for', 'are', 'with', 
                                   'this', 'that', 'have', 'from', 'can', 'will', 
                                   'would', 'could', 'should', 'please', 'thank', 'thanks']):
                        word_freq[word] += 1
        
        # Accumulate rubric scores
        for key in rubric_scores:
            rubric_scores[key] += analysis.rubricScores[key]
    
    # Calculate averages
    for key in rubric_scores:
        rubric_scores[key] = round(rubric_scores[key] / total_sessions)
    
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
        sessions=sessions
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

