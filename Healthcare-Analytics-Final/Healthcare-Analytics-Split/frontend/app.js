let currentView = 'single';
let currentBatchData = null;
let charts = {};

// Sample data
const singleExample = {
  "id": "example-session-1",
  "timestamp": "2025-01-15T10:30:00Z",
  "turns": [
    {"role": "user", "text": "I need to book an appointment with a cardiologist"},
    {"role": "bot", "text": "I can help you book a cardiology appointment. Which doctor would you prefer?"},
    {"role": "user", "text": "Dr. Smith please"},
    {"role": "bot", "text": "Dr. Smith is available. What date works for you?"},
    {"role": "user", "text": "Next Tuesday at 2 PM"},
    {"role": "bot", "text": "Perfect! I have Dr. Smith available next Tuesday at 2 PM. Shall I confirm this appointment?"},
    {"role": "user", "text": "Yes, please confirm"},
    {"role": "bot", "text": "Your appointment with Dr. Smith is confirmed for next Tuesday at 2 PM. You'll receive a confirmation email shortly."}
  ]
};

const batchExample = generateBatchData(150); // Generate 150 sessions

function generateBatchData(count) {
  const sessions = [];
  const specialties = ['cardiology', 'dermatology', 'pediatrics', 'orthopedics', 'ent', 'general'];
  const doctors = ['Dr. Smith', 'Dr. Johnson', 'Dr. Brown', 'Dr. Davis', 'Dr. Wilson', 'Dr. Miller', 'Dr. Garcia', 'Dr. Martinez'];
  
  for (let i = 1; i <= count; i++) {
    const sessionType = Math.random();
    let session;
    
    if (sessionType < 0.4) {
      // 40% - Successful completions
      session = generateSuccessfulSession(i, specialties, doctors);
    } else if (sessionType < 0.6) {
      // 20% - Abandoned sessions
      session = generateAbandonedSession(i, specialties, doctors);
    } else if (sessionType < 0.75) {
      // 15% - Error sessions (invalid input)
      session = generateErrorSession(i, specialties, doctors);
    } else if (sessionType < 0.85) {
      // 10% - Out-of-scope sessions
      session = generateOutOfScopeSession(i);
    } else {
      // 15% - Negative sentiment sessions
      session = generateNegativeSession(i, specialties, doctors);
    }
    
    sessions.push(session);
  }
  
  return sessions;
}

function generateSuccessfulSession(id, specialties, doctors) {
  const specialty = specialties[Math.floor(Math.random() * specialties.length)];
  const doctor = doctors[Math.floor(Math.random() * doctors.length)];
  
  // Create different session lengths
  const sessionLength = Math.random();
  let turns;
  
  if (sessionLength < 0.3) {
    // Short sessions (3-4 turns)
    turns = [
      {"role": "user", "text": `Book me a ${specialty} appointment with ${doctor}`},
      {"role": "bot", "text": `Perfect! I have ${doctor} available tomorrow at 2 PM. Confirm?`},
      {"role": "user", "text": "Yes, that's great! Thanks!"},
      {"role": "bot", "text": `Your appointment with ${doctor} is confirmed for tomorrow at 2 PM.`}
    ];
  } else if (sessionLength < 0.7) {
    // Medium sessions (5-6 turns)
    turns = [
      {"role": "user", "text": `I need to book an appointment with a ${specialty} specialist`},
      {"role": "bot", "text": `I can help you book a ${specialty} appointment. Which doctor would you prefer?`},
      {"role": "user", "text": `${doctor} please`},
      {"role": "bot", "text": `${doctor} is available. What date works for you?`},
      {"role": "user", "text": "Next Tuesday at 2 PM"},
      {"role": "bot", "text": `Perfect! I have ${doctor} available next Tuesday at 2 PM. Shall I confirm this appointment?`},
      {"role": "user", "text": "Yes, please confirm. Thank you so much!"},
      {"role": "bot", "text": `Your appointment with ${doctor} is confirmed for next Tuesday at 2 PM. You'll receive a confirmation email shortly.`}
    ];
  } else {
    // Long sessions (7-9 turns)
    turns = [
      {"role": "user", "text": `I need to book an appointment with a ${specialty} specialist`},
      {"role": "bot", "text": `I can help you book a ${specialty} appointment. Which doctor would you prefer?`},
      {"role": "user", "text": `${doctor} please`},
      {"role": "bot", "text": `${doctor} is available. What date works for you?`},
      {"role": "user", "text": "Next Tuesday at 2 PM"},
      {"role": "bot", "text": `${doctor} is available next Tuesday at 2 PM. What time would you prefer?`},
      {"role": "user", "text": "2 PM works perfectly"},
      {"role": "bot", "text": `Great! Shall I confirm this appointment with ${doctor} for next Tuesday at 2 PM?`},
      {"role": "user", "text": "Yes, please confirm. This is excellent, thank you!"},
      {"role": "bot", "text": `Your appointment with ${doctor} is confirmed for next Tuesday at 2 PM. You'll receive a confirmation email shortly.`}
    ];
  }
  
  return {
    "id": `success-${id}`,
    "timestamp": `2025-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}T${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00Z`,
    "turns": turns
  };
}

function generateAbandonedSession(id, specialties, doctors) {
  const specialty = specialties[Math.floor(Math.random() * specialties.length)];
  const doctor = doctors[Math.floor(Math.random() * doctors.length)];
  
  // Create different abandonment patterns
  const abandonmentType = Math.random();
  let turns;
  
  if (abandonmentType < 0.3) {
    // Quick abandonment (2-3 turns)
    turns = [
      {"role": "user", "text": `I need a ${specialty} appointment`},
      {"role": "bot", "text": `I can help you book a ${specialty} appointment. Which doctor would you prefer?`},
      {"role": "user", "text": "Actually, I'll call later"}
    ];
  } else if (abandonmentType < 0.7) {
    // Medium abandonment (4-5 turns)
    turns = [
      {"role": "user", "text": `I want to schedule a ${specialty} appointment`},
      {"role": "bot", "text": `I can help you book a ${specialty} appointment. Which doctor would you prefer?`},
      {"role": "user", "text": `${doctor} please`},
      {"role": "bot", "text": `${doctor} is available. What date works for you?`},
      {"role": "user", "text": "Actually, I need to think about it"}
    ];
  } else {
    // Long abandonment (6-7 turns)
    turns = [
      {"role": "user", "text": `I want to schedule a ${specialty} appointment`},
      {"role": "bot", "text": `I can help you book a ${specialty} appointment. Which doctor would you prefer?`},
      {"role": "user", "text": `${doctor} please`},
      {"role": "bot", "text": `${doctor} is available. What date works for you?`},
      {"role": "user", "text": "Next Tuesday"},
      {"role": "bot", "text": `Great! What time works for you on Tuesday?`},
      {"role": "user", "text": "I need to check my calendar first"}
    ];
  }
  
  return {
    "id": `abandoned-${id}`,
    "timestamp": `2025-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}T${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00Z`,
    "turns": turns
  };
}

function generateErrorSession(id, specialties, doctors) {
  const specialty = specialties[Math.floor(Math.random() * specialties.length)];
  const doctor = doctors[Math.floor(Math.random() * doctors.length)];
  
  return {
    "id": `error-${id}`,
    "timestamp": `2025-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}T${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00Z`,
    "turns": [
      {"role": "user", "text": `Book me a ${specialty} appointment`},
      {"role": "bot", "text": `I can help you book a ${specialty} appointment. Which doctor would you prefer?`},
      {"role": "user", "text": "asdf xyz"},
      {"role": "bot", "text": "I didn't understand that. Could you please specify which doctor you'd like?"},
      {"role": "user", "text": "12345"},
      {"role": "bot", "text": "I need a doctor's name. Please choose from our available doctors."},
      {"role": "user", "text": "This is stupid"}
    ]
  };
}

function generateOutOfScopeSession(id) {
  return {
    "id": `oos-${id}`,
    "timestamp": `2025-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}T${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00Z`,
    "turns": [
      {"role": "user", "text": "What's the weather like today?"},
      {"role": "bot", "text": "I can only help with appointment bookings. Would you like to book an appointment?"},
      {"role": "user", "text": "Tell me a joke"},
      {"role": "bot", "text": "I'm designed to help with medical appointments. Can I assist you with booking one?"},
      {"role": "user", "text": "What's 2+2?"},
      {"role": "bot", "text": "I can only help with appointment bookings. Would you like to schedule an appointment?"}
    ]
  };
}

function generateNegativeSession(id, specialties, doctors) {
  const specialty = specialties[Math.floor(Math.random() * specialties.length)];
  const doctor = doctors[Math.floor(Math.random() * doctors.length)];
  
  // Create different negative patterns
  const negativeType = Math.random();
  let turns;
  
  if (negativeType < 0.3) {
    // Short negative (3-4 turns)
    turns = [
      {"role": "user", "text": `I need a ${specialty} appointment`},
      {"role": "bot", "text": `I can help you book a ${specialty} appointment. Which doctor would you prefer?`},
      {"role": "user", "text": "This is taking too long, I'll call instead"},
      {"role": "bot", "text": "I understand your frustration. Would you like to try a different approach?"}
    ];
  } else if (negativeType < 0.7) {
    // Medium negative (5-6 turns)
    turns = [
      {"role": "user", "text": `I need a ${specialty} appointment`},
      {"role": "bot", "text": `I can help you book a ${specialty} appointment. Which doctor would you prefer?`},
      {"role": "user", "text": `${doctor}`},
      {"role": "bot", "text": `${doctor} is available. What date works for you?`},
      {"role": "user", "text": "This system is terrible and confusing"},
      {"role": "bot", "text": "I'm sorry you're having trouble. Would you like to try a different approach?"}
    ];
  } else {
    // Long negative (7-8 turns)
    turns = [
      {"role": "user", "text": `I need a ${specialty} appointment`},
      {"role": "bot", "text": `I can help you book a ${specialty} appointment. Which doctor would you prefer?`},
      {"role": "user", "text": `${doctor}`},
      {"role": "bot", "text": `${doctor} is available. What date works for you?`},
      {"role": "user", "text": "Next Tuesday"},
      {"role": "bot", "text": `Great! What time works for you on Tuesday?`},
      {"role": "user", "text": "This is ridiculous, I'm frustrated with this process"},
      {"role": "bot", "text": "I'm sorry you're having trouble. Would you like to try a different approach?"}
    ];
  }
  
  return {
    "id": `negative-${id}`,
    "timestamp": `2025-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}T${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00Z`,
    "turns": turns
  };
}

// View switching
function switchView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
  
  document.getElementById(view + '-view').classList.remove('hidden');
  document.querySelector(`[onclick="switchView('${view}')"]`).classList.add('active');
  
  currentView = view;
}

// Single session analysis
async function analyzeSingle() {
  const input = document.getElementById('singleInput').value.trim();
  if (!input) {
    alert('Please paste a chatlog JSON or load an example');
    return;
  }
  
  try {
    const sessionData = JSON.parse(input);
    
    // Try to call backend API first
    try {
      const response = await fetch('http://localhost:8000/evaluate_json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
      });
      
      if (response.ok) {
        const analysis = await response.json();
        displaySingleResults(analysis);
        return;
      }
    } catch (e) {
      console.log('Backend not available, using client-side analysis');
    }
    
    // Fallback to client-side analysis
    const analysis = analyzeSession(sessionData);
    displaySingleResults(analysis);
  } catch (e) {
    alert('Invalid JSON format: ' + e.message);
  }
}

function loadSingleExample() {
  document.getElementById('singleInput').value = JSON.stringify(singleExample, null, 2);
}

// Batch analysis
async function analyzeBatch() {
  const fileInput = document.getElementById('batchInput');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Please select a JSON file or load an example');
    return;
  }
  
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const chatlogs = Array.isArray(data) ? data : (data.chatlogs || []);
    
    if (chatlogs.length === 0) {
      alert('No chatlogs found in the file');
      return;
    }
    
    currentBatchData = chatlogs;
    
    // Try to call backend API first
    try {
      const response = await fetch('http://localhost:8000/batch_json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const analysis = await response.json();
        displayBatchResults(analysis);
        return;
      }
    } catch (e) {
      console.log('Backend not available, using client-side analysis');
    }
    
    // Fallback to client-side analysis
    const analysis = analyzeBatchData(chatlogs);
    displayBatchResults(analysis);
  } catch (e) {
    alert('Error reading file: ' + e.message);
  }
}

function loadBatchExample() {
  currentBatchData = batchExample;
  const analysis = analyzeBatchData(batchExample);
  displayBatchResults(analysis);
}

// Analysis functions
function analyzeSession(session) {
  const turns = session.turns || [];
  const isCompleted = turns.some(turn => 
    turn.role === 'bot' && 
    turn.text && 
    turn.text.toLowerCase().includes('confirmed')
  );
  
  const userMessages = turns.filter(t => t.role === 'user').map(t => t.text || '');
  
  // Enhanced sentiment analysis
  const positiveWords = ['thanks', 'thank you', 'great', 'perfect', 'excellent', 'good', 'wonderful', 'amazing', 'fantastic', 'awesome', 'brilliant', 'superb', 'outstanding', 'delighted', 'happy', 'pleased', 'satisfied', 'love', 'appreciate', 'helpful'];
  const negativeWords = ['terrible', 'awful', 'bad', 'hate', 'angry', 'frustrated', 'disappointed', 'upset', 'annoyed', 'stupid', 'ridiculous', 'horrible', 'useless', 'pathetic', 'disgusting', 'annoying', 'taking too long', 'system is terrible', 'this is stupid', 'not working', 'broken', 'confused', 'difficult', 'problem'];
  
  let sentimentScore = 0;
  const allUserText = userMessages.join(' ').toLowerCase();
  
  positiveWords.forEach(word => {
    if (allUserText.includes(word)) sentimentScore++;
  });
  
  negativeWords.forEach(word => {
    if (allUserText.includes(word)) sentimentScore--;
  });
  
  let userSentiment = 'neutral';
  if (sentimentScore > 0) userSentiment = 'positive';
  else if (sentimentScore < 0) userSentiment = 'negative';
  
  const errors = turns.filter(turn => 
    turn.role === 'user' && 
    (turn.text === 'asdf' || turn.text === 'xyz')
  ).length;
  
  const oos = turns.filter(turn => 
    turn.role === 'user' && 
    turn.text && 
    (turn.text.toLowerCase().includes('weather') || 
     turn.text.toLowerCase().includes('joke') || 
     turn.text.toLowerCase().includes('pizza'))
  ).length;
  
  // Calculate rubric scores
  const rubricScores = {
    satisfaction: isCompleted ? 100 : 0,
    coherence: turns.length <= 8 ? 100 : 80,
    relevance: 90,
    consistency: 85,
    adaptability: 80,
    memory: 75,
    efficiency: Math.max(0, 100 - (turns.length - 4) * 10)
  };
  
  const overallScore = Math.round(sum(Object.values(rubricScores)) / Object.keys(rubricScores).length);
  
  return {
    id: session.id || 'Unknown',
    completed: isCompleted,
    turnsCount: turns.length,
    overallScore: overallScore,
    userSentiment: userSentiment,
    efficiency: Math.max(0, 100 - (turns.length - 4) * 10),
    errors: errors,
    oos: oos,
    rubricScores: rubricScores,
    turns: turns
  };
}

function analyzeBatchData(chatlogs) {
  const totalSessions = chatlogs.length;
  let completedSessions = 0;
  let totalTurns = 0;
  let positiveSessions = 0;
  let neutralSessions = 0;
  let negativeSessions = 0;
  let totalScore = 0;
  let shortSessions = 0; // 1-4 turns
  let mediumSessions = 0; // 5-8 turns
  let longSessions = 0; // 9+ turns
  const wordFreq = {};
  const wordCloudByTime = {};
  const rubricScores = {
    satisfaction: 0,
    coherence: 0, 
    relevance: 0,
    consistency: 0,
    adaptability: 0,
    memory: 0,
    efficiency: 0
  };
  
  let reschedulingCount = 0;
  const appointmentTypes = {};
  const knowledgeBaseGaps = [];
  const trendDataByDate = {};
  
  chatlogs.forEach(session => {
    const analysis = analyzeSession(session);
    if (analysis.completed) completedSessions++;
    totalTurns += analysis.turnsCount;
    
    // Count sentiment sessions
    if (analysis.userSentiment === 'positive') positiveSessions++;
    else if (analysis.userSentiment === 'neutral') neutralSessions++;
    else if (analysis.userSentiment === 'negative') negativeSessions++;
    
    // Count duration sessions
    if (analysis.turnsCount <= 4) shortSessions++;
    else if (analysis.turnsCount <= 8) mediumSessions++;
    else longSessions++;
    
    totalScore += analysis.overallScore;
    
    // Detect rescheduling
    const sessionText = session.turns.map(t => t.text || '').join(' ').toLowerCase();
    if (sessionText.includes('reschedule') || sessionText.includes('rescheduling') || 
        sessionText.includes('change appointment') || sessionText.includes('move appointment')) {
      reschedulingCount++;
    }
    
    // Detect appointment types
    const specialties = ['cardiology', 'cardiac', 'heart', 'dermatology', 'skin', 'pediatrics', 'pediatric', 
                         'child', 'orthopedics', 'orthopedic', 'bone', 'ent', 'ear', 'nose', 'throat', 
                         'general', 'primary', 'flu', 'covid', 'vaccine', 'checkup', 'physical', 'dental', 'eye', 'vision'];
    for (const specialty of specialties) {
      if (sessionText.includes(specialty)) {
        appointmentTypes[specialty] = (appointmentTypes[specialty] || 0) + 1;
        break;
      }
    }
    
    // Track knowledge base gaps
    session.turns.forEach(turn => {
      if (turn.role === 'user' && turn.text) {
        const oosKeywords = ['weather', 'joke', 'pizza', 'recipe', 'sports', 'news', 'stock', 'movie'];
        if (oosKeywords.some(keyword => turn.text.toLowerCase().includes(keyword))) {
          knowledgeBaseGaps.push({
            query: turn.text,
            session_id: session.id,
            timestamp: session.timestamp,
            suggested_topic: 'General information queries'
          });
        }
      }
    });
    
    // Word frequency analysis with time grouping
    let monthKey = 'unknown';
    try {
      const sessionDate = new Date(session.timestamp);
      monthKey = sessionDate.toISOString().substring(0, 7); // YYYY-MM
    } catch (e) {
      // Use unknown if date parsing fails
    }
    
    if (!wordCloudByTime[monthKey]) {
      wordCloudByTime[monthKey] = {};
    }
    
    // Trend data by date
    try {
      const sessionDate = new Date(session.timestamp);
      const dateKey = sessionDate.toISOString().substring(0, 10); // YYYY-MM-DD
      if (!trendDataByDate[dateKey]) {
        trendDataByDate[dateKey] = { sessions: 0, completed: 0 };
      }
      trendDataByDate[dateKey].sessions++;
      if (analysis.completed) {
        trendDataByDate[dateKey].completed++;
      }
    } catch (e) {
      // Skip if date parsing fails
    }
    
    session.turns.forEach(turn => {
      if (turn.role === 'user' && turn.text) {
        const words = turn.text.toLowerCase().match(/\b\w+\b/g) || [];
        words.forEach(word => {
          if (word.length > 2 && !['the', 'and', 'you', 'for', 'are', 'with', 'this', 'that', 'have', 'from', 'can', 'will', 'would', 'could', 'should', 'please', 'thank', 'thanks'].includes(word)) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
            wordCloudByTime[monthKey][word] = (wordCloudByTime[monthKey][word] || 0) + 1;
          }
        });
      }
    });
    
    Object.keys(rubricScores).forEach(key => {
      rubricScores[key] += analysis.rubricScores[key];
    });
  });
  
  // Calculate averages
  Object.keys(rubricScores).forEach(key => {
    rubricScores[key] = Math.round(rubricScores[key] / totalSessions);
  });
  
  // Process trend data
  const sortedDates = Object.keys(trendDataByDate).sort();
  const trendData = {
    dates: sortedDates,
    sessions: sortedDates.map(date => trendDataByDate[date].sessions),
    completed: sortedDates.map(date => trendDataByDate[date].completed),
    conversionRates: sortedDates.map(date => {
      const data = trendDataByDate[date];
      return data.sessions > 0 ? Math.round((data.completed / data.sessions) * 100 * 100) / 100 : 0;
    })
  };
  
  return {
    totalSessions: totalSessions,
    successRate: Math.round((completedSessions / totalSessions) * 100),
    avgTurns: (totalTurns / totalSessions).toFixed(1),
    sentimentRate: Math.round((positiveSessions / totalSessions) * 100),
    overallScore: Math.round(totalScore / totalSessions),
    rubricScores: rubricScores,
    wordFreq: wordFreq,
    completedSessions: completedSessions,
    positiveSessions: positiveSessions,
    neutralSessions: neutralSessions,
    negativeSessions: negativeSessions,
    shortSessions: shortSessions,
    mediumSessions: mediumSessions,
    longSessions: longSessions,
    sessions: chatlogs.map(session => analyzeSession(session)),
    conversionRate: Math.round((completedSessions / totalSessions) * 100 * 100) / 100,
    trafficMetrics: {
      totalChats: totalSessions,
      uniqueUsers: totalSessions,
      avgSessionDuration: (totalTurns / totalSessions).toFixed(1),
      bounceRate: Math.round(((totalSessions - completedSessions) / totalSessions) * 100 * 100) / 100
    },
    reschedulingCount: reschedulingCount,
    appointmentTypes: appointmentTypes,
    trendData: trendData,
    knowledgeBaseGaps: knowledgeBaseGaps.slice(0, 20),
    wordCloudByTime: wordCloudByTime
  };
}

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

// Display functions
function displaySingleResults(analysis) {
  document.getElementById('single-session-id').textContent = analysis.id;
  document.getElementById('single-completion').textContent = analysis.completed ? '✅ Completed' : '⚠️ Incomplete';
  document.getElementById('single-turns').textContent = analysis.turnsCount;
  document.getElementById('single-score').textContent = analysis.overallScore + '%';
  document.getElementById('single-sentiment').textContent = analysis.userSentiment;
  document.getElementById('single-efficiency').textContent = analysis.efficiency + '%';
  document.getElementById('single-errors').textContent = analysis.errors;
  document.getElementById('single-oos').textContent = analysis.oos;
  
  // Render radar chart
  renderRadarChart('single-radar', analysis.rubricScores, 'Session Scores');
  
  // Render timeline
  renderTimeline('single-timeline-content', analysis.turns);
  
  // Render AI insights
  renderSingleAIInsights(analysis);
  
  document.getElementById('single-results').classList.remove('hidden');
}

function displayBatchResults(analysis) {
  document.getElementById('batch-success').textContent = analysis.successRate + '%';
  document.getElementById('batch-turns').textContent = analysis.avgTurns;
  document.getElementById('batch-sentiment').textContent = analysis.sentimentRate + '%';
  document.getElementById('batch-score').textContent = analysis.overallScore + '%';
  
  // Update new metrics if available
  if (analysis.conversionRate !== undefined) {
    const conversionEl = document.getElementById('batch-conversion');
    if (conversionEl) conversionEl.textContent = analysis.conversionRate + '%';
  }
  if (analysis.reschedulingCount !== undefined) {
    const rescheduleEl = document.getElementById('batch-rescheduling');
    if (rescheduleEl) rescheduleEl.textContent = analysis.reschedulingCount;
  }
  if (analysis.trafficMetrics) {
    const trafficEl = document.getElementById('batch-traffic');
    if (trafficEl) trafficEl.textContent = analysis.trafficMetrics.totalChats;
  }
  
  // Render charts
  renderRadarChart('batch-radar', analysis.rubricScores, 'Average Scores');
  
  // Render funnel chart
  renderFunnelChart('batch-funnel', {
    totalChats: analysis.totalSessions,
    confirmedBookings: analysis.completedSessions,
    conversionRate: analysis.conversionRate || analysis.successRate
  });
  
  // Render sentiment breakdown chart
  renderSentimentBreakdownChart('batch-sentiment-breakdown', {
    positiveSessions: analysis.positiveSessions,
    neutralSessions: analysis.neutralSessions,
    negativeSessions: analysis.negativeSessions
  });
  
  // Render duration analysis chart
  renderDurationAnalysisChart('batch-duration-analysis', {
    shortSessions: analysis.shortSessions,
    mediumSessions: analysis.mediumSessions,
    longSessions: analysis.longSessions
  });
  
  // Render trend analysis if available
  if (analysis.trendData && analysis.trendData.dates && analysis.trendData.dates.length > 0) {
    renderTrendAnalysisChart('batch-trend-analysis', analysis.trendData);
  }
  
  // Render appointment types chart if available
  if (analysis.appointmentTypes && Object.keys(analysis.appointmentTypes).length > 0) {
    renderAppointmentTypesChart('batch-appointment-types', analysis.appointmentTypes);
  }
  
  // Render word cloud with time filter
  renderWordCloud(analysis.wordFreq, analysis.wordCloudByTime);
  
  // Render knowledge base gaps if available
  if (analysis.knowledgeBaseGaps && analysis.knowledgeBaseGaps.length > 0) {
    renderKnowledgeBaseGaps(analysis.knowledgeBaseGaps);
  }
  
  // Render AI insights
  renderBatchAIInsights(analysis);
  
  // Render session list
  renderSessionList(analysis.sessions);
  
  // Store analysis for export
  window.currentBatchAnalysis = analysis;
  
  document.getElementById('batch-results').classList.remove('hidden');
}

function renderRadarChart(canvasId, scores, label) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  if (charts[canvasId]) charts[canvasId].destroy();

  charts[canvasId] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: Object.keys(scores).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
      datasets: [{
        label: label,
        data: Object.values(scores),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#d2dcecff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'transparent',
        pointRadius: 4,
        pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true,               
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          grid: { color: 'rgba(148,163,184,0.2)', circular: true },
          angleLines: { color: 'rgba(148,163,184,0.2)' },
          pointLabels: { color: '#f1f5f9', font: { size: 13, weight: '500' } },
          ticks: {
            color: 'rgba(235, 237, 240, 1)',   // number color (100, 90, etc)
            showLabelBackdrop: false,         
            backdropColor: 'transparent',     
            stepSize: 20,
            font: { size: 14 }
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          labels: { color: '#f1f5f9', font: { size: 14 } }
        },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.9)',
          titleColor: '#f1f5f9',
          bodyColor: '#f1f5f9',
          borderColor: 'rgba(59,130,246,0.3)',
          borderWidth: 1,
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || '';
              const value = context.parsed.r;
              const rubricName = context.label;
              let tooltipText = `${label}: ${value}%`;
              const explanations = {
                'Satisfaction': 'How well the bot met user needs and expectations',
                'Coherence': 'Logical flow and consistency of responses',
                'Relevance': 'How well responses address user queries',
                'Consistency': 'Uniform behavior and tone throughout',
                'Adaptability': 'Ability to handle different user inputs',
                'Memory': 'Retention of context across conversation',
                'Efficiency': 'Achieving goals with minimal turns'
              };
              if (explanations[rubricName]) tooltipText += `\n${explanations[rubricName]}`;
              return tooltipText;
            }
          }
        }
      }
    }
  });
}


function renderSessionList(sessions) {
  const container = document.getElementById('session-list');
  container.innerHTML = '';
  
  sessions.forEach((session, index) => {
    const sessionCard = document.createElement('div');
    sessionCard.className = 'session-card';
    sessionCard.onclick = () => viewSingleFromBatch(session, index);
    
    sessionCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>${session.id}</strong>
          <div style="font-size: 14px; color: #94a3b8; margin-top: 4px;">
            <span class="status-badge ${session.completed ? 'status-completed' : 'status-abandoned'}">
              ${session.completed ? 'Completed' : 'Abandoned'}
            </span>
            <span style="margin-left: 8px;">${session.turnsCount} turns</span>
            <span style="margin-left: 8px;">${session.userSentiment}</span>
          </div>
        </div>
        <div style="font-size: 18px;">
          ${session.completed ? '✅' : '⚠️'}
        </div>
      </div>
    `;
    
    container.appendChild(sessionCard);
  });
}

function viewSingleFromBatch(sessionAnalysis, index) {
  // Switch to single view
  switchView('single');
  
  // Populate single view with this session
  document.getElementById('singleInput').value = JSON.stringify(currentBatchData[index], null, 2);
  
  // Display the analysis
  displaySingleResults(sessionAnalysis);
}

function renderFunnelChart(canvasId, funnelData) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  if (charts[canvasId]) charts[canvasId].destroy();
  
  charts[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Total Chats', 'Confirmed Bookings'],
      datasets: [{
        label: 'Count',
        data: [funnelData.totalChats, funnelData.confirmedBookings],
        backgroundColor: ['rgba(59, 130, 246, 0.6)', 'rgba(34, 197, 94, 0.6)'],
        borderColor: ['rgba(59, 130, 246, 1)', 'rgba(34, 197, 94, 1)'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
                if (context.label === 'Confirmed Bookings') {
                  label += ` (${funnelData.conversionRate.toFixed(1)}% conversion)`;
                }
              }
              return label;
            }
          }
        }
      }
    }
  });
}

function renderSentimentBreakdownChart(canvasId, sentimentData) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  if (charts[canvasId]) charts[canvasId].destroy();
  
  charts[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [{
        label: 'Sessions',
        data: [sentimentData.positiveSessions, sentimentData.neutralSessions, sentimentData.negativeSessions],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)', // Green for Positive
          'rgba(250, 204, 21, 0.6)', // Yellow for Neutral
          'rgba(239, 68, 68, 0.6)' // Red for Negative
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(250, 204, 21, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function renderDurationAnalysisChart(canvasId, durationData) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  if (charts[canvasId]) charts[canvasId].destroy();
  
  charts[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Short (1-4 turns)', 'Medium (5-8 turns)', 'Long (9+ turns)'],
      datasets: [{
        label: 'Sessions',
        data: [durationData.shortSessions, durationData.mediumSessions, durationData.longSessions],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)', // Green for Short
          'rgba(250, 204, 21, 0.6)', // Yellow for Medium
          'rgba(239, 68, 68, 0.6)' // Red for Long
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(250, 204, 21, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
                const total = durationData.shortSessions + durationData.mediumSessions + durationData.longSessions;
                const percentage = ((context.parsed.y / total) * 100).toFixed(1);
                label += ` (${percentage}%)`;
              }
              return label;
            }
          }
        }
      }
    }
  });
}

function renderTrendAnalysisChart(canvasId, trendData) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  if (charts[canvasId]) charts[canvasId].destroy();
  
  charts[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trendData.dates || trendData.months || [],
      datasets: [
        {
          label: 'Conversion Rate (%)',
          data: trendData.conversionRates || trendData.successRates || [],
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          yAxisID: 'y',
          fill: true
        },
        {
          label: 'Total Sessions',
          data: trendData.sessions || trendData.avgTurns || [],
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          yAxisID: 'y1',
          fill: true
        },
        {
          label: 'Completed Sessions',
          data: trendData.completed || trendData.sentimentRates || [],
          borderColor: 'rgba(168, 85, 247, 1)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.4,
          yAxisID: 'y1',
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date',
            color: '#f1f5f9'
          },
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(148,163,184,0.1)' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Conversion Rate (%)',
            color: '#f1f5f9'
          },
          min: 0,
          max: 100,
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(148,163,184,0.1)' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Session Count',
            color: '#f1f5f9'
          },
          min: 0,
          ticks: { color: '#94a3b8' },
          grid: {
            drawOnChartArea: false,
          },
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#f1f5f9' }
        },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.9)',
          titleColor: '#f1f5f9',
          bodyColor: '#f1f5f9',
          borderColor: 'rgba(59,130,246,0.3)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
                if (context.dataset.label === 'Conversion Rate (%)') {
                  label += '%';
                } else {
                  label += ' sessions';
                }
              }
              return label;
            }
          }
        }
      }
    }
  });
}

function renderAppointmentTypesChart(canvasId, appointmentTypes) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  if (charts[canvasId]) charts[canvasId].destroy();
  
  const labels = Object.keys(appointmentTypes);
  const data = Object.values(appointmentTypes);
  
  charts[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        label: 'Appointment Types',
        data: data,
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(250, 204, 21, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          'rgba(168, 85, 247, 0.6)',
          'rgba(236, 72, 153, 0.6)',
          'rgba(14, 165, 233, 0.6)',
          'rgba(251, 146, 60, 0.6)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(250, 204, 21, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(251, 146, 60, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: { color: '#f1f5f9' }
        },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.9)',
          titleColor: '#f1f5f9',
          bodyColor: '#f1f5f9',
          borderColor: 'rgba(59,130,246,0.3)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

function renderKnowledgeBaseGaps(gaps) {
  const container = document.getElementById('knowledge-base-gaps');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!gaps || gaps.length === 0) {
    container.innerHTML = '<div style="color: #94a3b8;">No knowledge base gaps detected</div>';
    return;
  }
  
  const gapsList = document.createElement('div');
  gapsList.style.display = 'grid';
  gapsList.style.gap = '12px';
  
  gaps.slice(0, 10).forEach((gap, index) => {
    const gapCard = document.createElement('div');
    gapCard.style.background = 'rgba(239, 68, 68, 0.1)';
    gapCard.style.border = '1px solid rgba(239, 68, 68, 0.3)';
    gapCard.style.borderRadius = '8px';
    gapCard.style.padding = '12px';
    gapCard.innerHTML = `
      <div style="font-weight: 600; color: #ef4444; margin-bottom: 4px;">Gap #${index + 1}</div>
      <div style="color: #f1f5f9; margin-bottom: 4px;"><strong>Query:</strong> "${gap.query || 'N/A'}"</div>
      <div style="color: #94a3b8; font-size: 12px;">
        <strong>Session:</strong> ${gap.session_id || 'N/A'} | 
        <strong>Suggested Topic:</strong> ${gap.suggested_topic || 'General information'}
      </div>
    `;
    gapsList.appendChild(gapCard);
  });
  
  container.appendChild(gapsList);
}

async function exportToPowerBI() {
  if (!window.currentBatchAnalysis || !currentBatchData) {
    alert('Please analyze batch data first');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:8000/export/powerbi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentBatchData)
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'chatbot_analytics.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      alert('Error exporting data');
    }
  } catch (e) {
    console.error('Export error:', e);
    alert('Error exporting data. Make sure backend is running.');
  }
}

function renderWordCloud(wordFreq, wordCloudByTime = null) {
  const container = document.getElementById('wordCloud');
  container.innerHTML = '';
  
  if (!wordFreq || Object.keys(wordFreq).length === 0) {
    container.innerHTML = '<div style="color: #94a3b8;">No word data available</div>';
    return;
  }
  
  // Add time filter if available
  if (wordCloudByTime && Object.keys(wordCloudByTime).length > 0) {
    const filterContainer = document.createElement('div');
    filterContainer.style.marginBottom = '16px';
    filterContainer.innerHTML = `
      <label style="color: #94a3b8; margin-right: 8px;">Filter by month:</label>
      <select id="wordCloudTimeFilter" style="background: rgba(15, 23, 42, 0.5); border: 1px solid var(--border); border-radius: 8px; padding: 8px; color: var(--text);">
        <option value="all">All Time</option>
        ${Object.keys(wordCloudByTime).sort().reverse().map(month => 
          `<option value="${month}">${month}</option>`
        ).join('')}
      </select>
    `;
    container.appendChild(filterContainer);
    
    const filterSelect = document.getElementById('wordCloudTimeFilter');
    const contentDiv = document.createElement('div');
    contentDiv.id = 'wordCloudContent';
    container.appendChild(contentDiv);
    renderWordCloudContent(contentDiv, wordFreq);
    
    filterSelect.onchange = function() {
      const selectedMonth = this.value;
      const filteredFreq = selectedMonth === 'all' ? wordFreq : wordCloudByTime[selectedMonth] || {};
      const contentDiv = document.getElementById('wordCloudContent');
      if (contentDiv) {
        renderWordCloudContent(contentDiv, filteredFreq);
      }
    };
  } else {
    renderWordCloudContent(container, wordFreq);
  }
}

function renderWordCloudContent(container, wordFreq) {
  // Always clear the container before rendering new content
  container.innerHTML = '';
  
  const sortedWords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 30); // Top 30 words
  
  if (sortedWords.length === 0) {
    container.innerHTML = '<div style="color: #94a3b8;">No word data for selected period</div>';
    return;
  }
  
  const maxFreq = Math.max(...sortedWords.map(([,freq]) => freq));
  
  sortedWords.forEach(([word, freq]) => {
    const intensity = freq / maxFreq;
    const fontSize = Math.max(12, Math.min(24, 12 + intensity * 12));
    
    let color = '#94a3b8';
    if (intensity > 0.8) color = '#3b82f6';
    else if (intensity > 0.6) color = '#10b981';
    else if (intensity > 0.4) color = '#f59e0b';
    else if (intensity > 0.2) color = '#ef4444';
    
    const wordElement = document.createElement('span');
    wordElement.className = 'word-item';
    wordElement.textContent = word;
    wordElement.style.fontSize = fontSize + 'px';
    wordElement.style.color = color;
    wordElement.title = `${word}: ${freq} times`;
    
    container.appendChild(wordElement);
  });
}

function renderSingleAIInsights(analysis) {
  const container = document.getElementById('single-ai-content');
  let insights = [];

  // Deep session analysis
  const turns = analysis.turns || [];
  const userMessages = turns.filter(t => t.role === 'user').map(t => t.text || '');
  const botMessages = turns.filter(t => t.role === 'bot').map(t => t.text || '');
  
  // 1. Completion Analysis with Root Cause
  if (analysis.completed) {
    insights.push("✅ <strong>Successful Completion:</strong> This session achieved its goal with " + analysis.turnsCount + " turns.");
    
    // Analyze what made it successful
    if (analysis.turnsCount <= 4) {
      insights.push("🚀 <strong>Efficiency Excellence:</strong> Completed in " + analysis.turnsCount + " turns - this is optimal. The user knew exactly what they wanted and the bot delivered quickly. Replicate this pattern for other users.");
    } else if (analysis.turnsCount <= 6) {
      insights.push("⚡ <strong>Good Efficiency:</strong> " + analysis.turnsCount + " turns is reasonable for a booking. The conversation flowed well without unnecessary back-and-forth.");
    } else {
      insights.push("🔄 <strong>Complex Success:</strong> Completed in " + analysis.turnsCount + " turns - longer than ideal but still successful. The user had specific requirements that required more discussion.");
    }
  } else {
    insights.push("❌ <strong>Session Abandonment:</strong> User did not complete the booking after " + analysis.turnsCount + " turns.");
    
    // Analyze abandonment patterns
    if (analysis.turnsCount <= 3) {
      insights.push("🚨 <strong>Immediate Drop-off:</strong> User abandoned after only " + analysis.turnsCount + " turns. This suggests the initial experience was confusing or unhelpful. Check the opening bot message and first interaction.");
    } else if (analysis.turnsCount <= 5) {
      insights.push("⚠️ <strong>Early Abandonment:</strong> User left after " + analysis.turnsCount + " turns. They started the process but didn't get far. The booking flow may be too complex or unclear.");
    } else {
      insights.push("🔄 <strong>Late Abandonment:</strong> User engaged for " + analysis.turnsCount + " turns before leaving. They were invested but something prevented completion. Look for friction points in the middle-to-end of the flow.");
    }
  }

  // 2. Sentiment Analysis with Context
  if (analysis.userSentiment === 'positive') {
    insights.push("😊 <strong>Positive User Experience:</strong> User expressed satisfaction throughout the conversation. This emotional state likely contributed to completion success.");
  } else if (analysis.userSentiment === 'negative') {
    insights.push("😠 <strong>Negative User Experience:</strong> User expressed frustration or dissatisfaction. This emotional state likely contributed to abandonment - identify and address the specific pain points.");
  } else {
    insights.push("😐 <strong>Neutral User Experience:</strong> User maintained a neutral tone throughout. While not negative, there were no positive emotional moments to reinforce engagement.");
  }

  // 3. Conversation Flow Analysis
  if (analysis.turnsCount > 0) {
    const firstUserMessage = userMessages[0] || '';
    const lastUserMessage = userMessages[userMessages.length - 1] || '';
    
    if (firstUserMessage.toLowerCase().includes('appointment') && firstUserMessage.toLowerCase().includes('book')) {
      insights.push("🎯 <strong>Clear Intent:</strong> User started with clear booking intent ('" + firstUserMessage.substring(0, 50) + "...'). The bot should have recognized this immediately and streamlined the process.");
    }
    
    if (lastUserMessage.toLowerCase().includes('think') || lastUserMessage.toLowerCase().includes('later') || lastUserMessage.toLowerCase().includes('call')) {
      insights.push("🤔 <strong>Decision Delay:</strong> User ended with hesitation ('" + lastUserMessage + "'). This suggests they need more information or reassurance before committing. Consider adding confidence-building elements.");
    }
  }

  // 4. Error Pattern Analysis
  if (analysis.errors > 0) {
    insights.push("❌ <strong>Input Recognition Failure:</strong> " + analysis.errors + " invalid inputs detected. The bot couldn't understand user responses - improve input validation and provide clearer examples of acceptable responses.");
  }

  if (analysis.oos > 0) {
    insights.push("🔍 <strong>Capability Gap:</strong> " + analysis.oos + " out-of-scope queries. User asked for features the bot doesn't have - either expand capabilities or better communicate limitations upfront.");
  }

  // 5. Rubric Performance Deep Dive
  const lowestRubric = Object.entries(analysis.rubricScores).reduce((min, [key, value]) => 
    value < analysis.rubricScores[min[0]] ? [key, value] : min
  );
  
  if (lowestRubric[1] < 50) {
    const rubricName = lowestRubric[0].charAt(0).toUpperCase() + lowestRubric[0].slice(1);
    insights.push("🔧 <strong>Critical Weakness:</strong> " + rubricName + " scored only " + lowestRubric[1] + "%. This is the biggest opportunity for improvement in this session type.");
  }

  // 6. Efficiency Analysis
  if (analysis.efficiency < 50) {
    insights.push("🐌 <strong>Inefficient Process:</strong> Efficiency score of " + analysis.efficiency + "% indicates the conversation took too many turns to reach its goal. Streamline the flow by reducing decision points and providing more direct paths.");
  } else if (analysis.efficiency > 80) {
    insights.push("⚡ <strong>Highly Efficient:</strong> " + analysis.efficiency + "% efficiency score shows optimal conversation flow. This pattern should be replicated across other sessions.");
  }

  // 7. Strategic Recommendations
  if (!analysis.completed && analysis.turnsCount > 6) {
    insights.push("🎯 <strong>Action Required:</strong> This session shows a user who was engaged but couldn't complete. Focus on removing friction in the final steps of the booking process.");
  } else if (analysis.completed && analysis.turnsCount <= 4) {
    insights.push("🚀 <strong>Success Pattern:</strong> This session represents an ideal user journey. Analyze what made it successful and optimize other flows to match this efficiency.");
  }

  if (insights.length === 0) {
    container.innerHTML = '<div style="color: #94a3b8;">No specific insights available for this session.</div>';
  } else {
    container.innerHTML = '<ul>' + insights.map(i => `<li>${i}</li>`).join('') + '</ul>';
  }
}

function renderBatchAIInsights(analysis) {
  const container = document.getElementById('batch-ai-content');
  let insights = [];

  // Deep data analysis insights
  const totalSessions = analysis.totalSessions;
  const completionRate = analysis.successRate;
  const avgTurns = parseFloat(analysis.avgTurns);
  const sentimentRate = analysis.sentimentRate;
  
  // 1. Conversion Funnel Analysis
  const funnelDropoff = ((analysis.totalSessions - analysis.completedSessions) / analysis.totalSessions) * 100;
  if (funnelDropoff > 60) {
    insights.push("🚨 <strong>Critical Funnel Drop-off:</strong> " + funnelDropoff.toFixed(1) + "% of users abandon the booking process. This suggests fundamental UX issues - users can't find what they need or the process is too complex.");
  } else if (funnelDropoff > 40) {
    insights.push("⚠️ <strong>Significant Conversion Loss:</strong> " + funnelDropoff.toFixed(1) + "% abandonment rate indicates friction points. Most users start but don't complete - focus on streamlining the middle of the funnel.");
  }

  // 2. Session Length vs Success Correlation
  const shortSuccessRate = analysis.shortSessions > 0 ? (analysis.completedSessions / analysis.shortSessions) * 100 : 0;
  const longSuccessRate = analysis.longSessions > 0 ? (analysis.completedSessions / analysis.longSessions) * 100 : 0;
  
  if (shortSuccessRate > longSuccessRate && analysis.shortSessions > 10) {
    insights.push("📈 <strong>Efficiency Advantage:</strong> Shorter sessions (" + analysis.shortSessions + " sessions) have higher success rates than longer ones (" + analysis.longSessions + " sessions). Users who know what they want succeed faster - consider adding quick booking options.");
  } else if (longSuccessRate > shortSuccessRate && analysis.longSessions > 10) {
    insights.push("🔄 <strong>Complexity Pattern:</strong> Longer sessions (" + analysis.longSessions + " sessions) actually succeed more than short ones (" + analysis.shortSessions + " sessions). Users need more guidance - your bot should ask clarifying questions rather than rushing.");
  }

  // 3. Sentiment vs Completion Correlation
  const positiveCompletionRate = analysis.positiveSessions > 0 ? (analysis.completedSessions / analysis.positiveSessions) * 100 : 0;
  const negativeCompletionRate = analysis.negativeSessions > 0 ? (analysis.completedSessions / analysis.negativeSessions) * 100 : 0;
  
  if (positiveCompletionRate > 80 && analysis.positiveSessions > 5) {
    insights.push("😊 <strong>Sentiment-Success Link:</strong> " + analysis.positiveSessions + " positive sessions show " + positiveCompletionRate.toFixed(1) + "% completion rate. Happy users complete bookings - focus on creating positive moments early in conversations.");
  } else if (negativeCompletionRate < 20 && analysis.negativeSessions > 5) {
    insights.push("😠 <strong>Frustration Impact:</strong> " + analysis.negativeSessions + " negative sessions have only " + negativeCompletionRate.toFixed(1) + "% completion rate. Frustrated users abandon - identify and fix pain points before they escalate.");
  }

  // 4. Word Frequency Insights
  const topWords = Object.entries(analysis.wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  if (topWords.length > 0) {
    const appointmentMentions = analysis.wordFreq['appointment'] || 0;
    const needMentions = analysis.wordFreq['need'] || 0;
    const bookMentions = analysis.wordFreq['book'] || 0;
    
    if (appointmentMentions > totalSessions * 0.8) {
      insights.push("📝 <strong>High Intent Language:</strong> 'appointment' appears " + appointmentMentions + " times across " + totalSessions + " sessions. Users are clear about their goal - your bot should recognize this intent immediately and streamline the process.");
    }
    
    if (needMentions > totalSessions * 0.6) {
      insights.push("🎯 <strong>Urgency Indicators:</strong> 'need' appears " + needMentions + " times, suggesting users have urgent requirements. Consider adding priority booking options or same-day availability features.");
    }
    
    if (bookMentions > totalSessions * 0.5) {
      insights.push("💡 <strong>Action-Oriented Users:</strong> 'book' appears " + bookMentions + " times, showing users want to take action quickly. Reduce friction in the booking confirmation step.");
    }
  }

  // 5. Rubric Performance Analysis
  const lowestRubric = Object.entries(analysis.rubricScores).reduce((min, [key, value]) => 
    value < analysis.rubricScores[min[0]] ? [key, value] : min
  );
  
  if (lowestRubric[1] < 50) {
    const rubricName = lowestRubric[0].charAt(0).toUpperCase() + lowestRubric[0].slice(1);
    insights.push("🔧 <strong>Critical Performance Gap:</strong> " + rubricName + " scores only " + lowestRubric[1] + "% across all sessions. This is your biggest opportunity - improving this could increase completion rates by 20-30%.");
  }

  // 6. Session Pattern Analysis
  const avgTurnsPerSession = avgTurns;
  if (avgTurnsPerSession > 8) {
    insights.push("⏱️ <strong>Conversation Length Concern:</strong> Average " + avgTurnsPerSession + " turns per session is high. Users are struggling to complete simple bookings - consider adding guided workflows or reducing decision points.");
  } else if (avgTurnsPerSession < 4) {
    insights.push("⚡ <strong>Efficiency Opportunity:</strong> Average " + avgTurnsPerSession + " turns suggests users complete quickly when they can. Scale this efficiency by adding more self-service options and reducing bot dependency.");
  }

  // 7. Data Quality Insights
  if (analysis.errors > 0) {
    const errorRate = (analysis.errors / totalSessions) * 100;
    insights.push("❌ <strong>Input Recognition Issues:</strong> " + analysis.errors + " error inputs detected (" + errorRate.toFixed(1) + "% of sessions). Users are providing invalid data - improve input validation and provide clearer examples.");
  }

  if (analysis.oos > 0) {
    const oosRate = (analysis.oos / totalSessions) * 100;
    insights.push("🔍 <strong>Scope Expansion Opportunity:</strong> " + analysis.oos + " out-of-scope queries (" + oosRate.toFixed(1) + "% of sessions). Users want features you don't offer - consider expanding capabilities or better communicating limitations.");
  }

  // 8. Strategic Recommendations
  if (completionRate < 40) {
    insights.push("🎯 <strong>Strategic Priority:</strong> With only " + completionRate + "% completion rate, focus on the fundamentals: simplify the booking flow, reduce steps, and add progress indicators. Small improvements here will have the biggest impact.");
  } else if (completionRate > 70) {
    insights.push("🚀 <strong>Optimization Phase:</strong> " + completionRate + "% completion rate is strong. Focus on optimization: reduce session length, improve user satisfaction, and add advanced features like scheduling preferences.");
  }
  
  // 9. Appointment Type Analysis & Knowledge Base Optimization
  if (analysis.appointmentTypes && Object.keys(analysis.appointmentTypes).length > 0) {
    const topAppointmentType = Object.entries(analysis.appointmentTypes)
      .sort(([,a], [,b]) => b - a)[0];
    if (topAppointmentType) {
      insights.push("🏥 <strong>Appointment Type Insights:</strong> '" + topAppointmentType[0] + "' is the most requested appointment type (" + topAppointmentType[1] + " requests). <strong>Optimize your GenAI knowledge base</strong> to provide comprehensive information about this specialty. Currently your chatbot is rule-based (one point to next), but you can enhance it with better FAQ coverage for popular appointment types.");
    }
    
    const appointmentTypeCount = Object.keys(analysis.appointmentTypes).length;
    if (appointmentTypeCount > 5) {
      insights.push("📚 <strong>Knowledge Base Diversification:</strong> Users are booking " + appointmentTypeCount + " different appointment types. Ensure your knowledge base covers all these specialties with detailed FAQs and appointment booking information.");
    }
  }
  
  // 10. Knowledge Base Gap Analysis
  if (analysis.knowledgeBaseGaps && analysis.knowledgeBaseGaps.length > 0) {
    insights.push("🔍 <strong>Knowledge Base Gaps Detected:</strong> " + analysis.knowledgeBaseGaps.length + " out-of-scope queries found. <strong>Constantly update your knowledge base</strong> - when questions are out of scope, the chatbot can't answer them. Review the gap analysis section to identify topics to add to your FAQ and knowledge base.");
    
    const uniqueGapTopics = new Set(analysis.knowledgeBaseGaps.map(gap => gap.suggested_topic));
    if (uniqueGapTopics.size > 0) {
      insights.push("💡 <strong>Recommended Knowledge Base Updates:</strong> Add content for: " + Array.from(uniqueGapTopics).join(', ') + ". This will reduce out-of-scope queries and improve user satisfaction.");
    }
  }
  
  // 11. Rescheduling Analysis
  if (analysis.reschedulingCount !== undefined && analysis.reschedulingCount > 0) {
    const reschedulingRate = ((analysis.reschedulingCount / totalSessions) * 100).toFixed(1);
    insights.push("🔄 <strong>Rescheduling Activity:</strong> " + analysis.reschedulingCount + " sessions (" + reschedulingRate + "%) involved rescheduling. This indicates users need flexibility. Ensure your chatbot can easily facilitate rescheduling - this is a key feature for appointment management.");
  }
  
  // 12. Trend Analysis Recommendations
  if (analysis.trendData && analysis.trendData.conversionRates && analysis.trendData.conversionRates.length > 1) {
    const recentRate = analysis.trendData.conversionRates[analysis.trendData.conversionRates.length - 1];
    const earlierRate = analysis.trendData.conversionRates[0];
    if (recentRate > earlierRate) {
      const improvement = (recentRate - earlierRate).toFixed(1);
      insights.push("📈 <strong>Growing Conversion Rate:</strong> Conversion rate has improved by " + improvement + "% over time. This indicates your chatbot optimizations are working! Continue monitoring trends to maximize conversion rates.");
    } else if (recentRate < earlierRate) {
      const decline = (earlierRate - recentRate).toFixed(1);
      insights.push("⚠️ <strong>Declining Conversion Rate:</strong> Conversion rate has decreased by " + decline + "% over time. Investigate recent changes and identify what's causing the drop. Check trend analysis chart for specific dates.");
    }
  }

  if (insights.length === 0) {
    container.innerHTML = '<div style="color: #94a3b8;">No specific insights generated for this batch.</div>';
  } else {
    container.innerHTML = '<ul>' + insights.map(i => `<li>${i}</li>`).join('') + '</ul>';
  }
}

function renderTimeline(containerId, turns) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  if (!turns || turns.length === 0) {
    container.innerHTML = '<div style="color: #94a3b8;">No conversation data available.</div>';
    return;
  }
  
  turns.forEach((turn, index) => {
    const item = document.createElement('div');
    item.className = `timeline-item ${turn.role}`;
    
    item.innerHTML = `
      <div class="timeline-role">${turn.role}</div>
      <div class="timeline-text">${turn.text || ''}</div>
    `;
    
    container.appendChild(item);
  });
}

// Guardrails functions
async function evaluateGuardrailsSingle() {
  const input = document.getElementById('singleInput').value.trim();
  if (!input) {
    alert('Please analyze a single session first or paste session JSON');
    return;
  }
  
  try {
    const sessionData = JSON.parse(input);
    const response = await fetch('http://localhost:8000/guardrails/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData)
    });
    
    if (response.ok) {
      const metrics = await response.json();
      displayGuardrailsResults(metrics);
    } else {
      alert('Error evaluating guardrails');
    }
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

async function evaluateGuardrailsBatch() {
  if (!currentBatchData) {
    alert('Please analyze batch data first');
    return;
  }
  
  try {
    // Ensure data is in correct format
    if (!Array.isArray(currentBatchData)) {
      alert('Batch data is not in the correct format. Please analyze batch data again.');
      return;
    }
    
    if (currentBatchData.length === 0) {
      alert('No batch data available. Please analyze batch data first.');
      return;
    }
    
    const batchRequest = { chatlogs: currentBatchData };
    const response = await fetch('http://localhost:8000/guardrails/evaluate_batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batchRequest)
    });
    
    if (response.ok) {
      const result = await response.json();
      displayGuardrailsBatchResults(result);
    } else {
      const errorText = await response.text();
      console.error('Guardrails error:', errorText);
      alert('Error evaluating guardrails: ' + (errorText || response.statusText));
    }
  } catch (e) {
    console.error('Guardrails fetch error:', e);
    alert('Error connecting to backend: ' + e.message + '\n\nMake sure the backend is running on http://localhost:8000');
  }
}

function displayGuardrailsResults(metrics) {
  const container = document.getElementById('guardrails-content');
  const resultsDiv = document.getElementById('guardrails-results');
  
  // Tooltip explanations
  const guardrailExplanations = {
    'Safety Check': 'Detects harmful content, self-harm indicators, and inappropriate language. Critical for healthcare applications.',
    'PII Protection': 'Prevents leakage of personally identifiable information (SSN, phone, email, credit card) in bot responses.',
    'Medical Accuracy': 'Ensures appropriate medical language and avoids making guarantees or promises about treatment outcomes.',
    'Relevance Check': 'Measures if bot responses are relevant to user queries using keyword overlap analysis.',
    'Coherence Check': 'Ensures logical flow and consistency in conversations, detecting topic changes and contradictions.',
    'Completeness Check': 'Verifies bot provides complete information including greeting, confirmation, details, and next steps.',
    'Efficiency Check': 'Measures conversation efficiency based on turn count. Fewer turns for completed sessions = higher efficiency.'
  };
  
  let html = `
    <div class="kpis">
      <div class="kpi tooltip">
        <div class="kpi-label">Overall Guardrail Score</div>
        <div class="kpi-value">${metrics.overall_score.toFixed(1)}%</div>
        <span class="tooltiptext">Average score across all 7 guardrail checks. Higher is better - aim for 80%+.</span>
      </div>
      <div class="kpi tooltip">
        <div class="kpi-label">Passed</div>
        <div class="kpi-value">${metrics.passed_count}/${metrics.total_guardrails}</div>
        <span class="tooltiptext">Number of guardrail checks that passed (score >= 70%) out of total guardrails evaluated.</span>
      </div>
      <div class="kpi tooltip">
        <div class="kpi-label">Failed</div>
        <div class="kpi-value">${metrics.failed_count}</div>
        <span class="tooltiptext">Number of guardrail checks that failed (score < 70%). These need attention.</span>
      </div>
    </div>
    
    <h4>Category Scores</h4>
    <div class="kpis">
  `;
  
  const categoryTooltips = {
    'Safety': 'Combined score for Safety Check and PII Protection. Critical for healthcare - should be 100%.',
    'Accuracy': 'Medical Accuracy score. Ensures appropriate medical language. Target: 85%+.',
    'Quality': 'Average of Relevance, Coherence, and Completeness checks. Measures response quality. Target: 75%+.',
    'Efficiency': 'Efficiency Check score. Measures conversation turn count optimization. Target: 70%+.'
  };
  
  for (const [category, score] of Object.entries(metrics.category_scores)) {
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    const tooltipText = categoryTooltips[categoryName] || `Average score for ${categoryName} category.`;
    html += `
      <div class="kpi tooltip">
        <div class="kpi-label">${categoryName}</div>
        <div class="kpi-value">${score.toFixed(1)}%</div>
        <span class="tooltiptext">${tooltipText}</span>
      </div>
    `;
  }
  
  html += `</div><h4>Individual Guardrails</h4><div style="display: grid; gap: 12px;">`;
  
  for (const result of metrics.guardrail_results) {
    const status = result.passed ? '✅' : '❌';
    const color = result.passed ? '#10b981' : '#ef4444';
    const explanation = guardrailExplanations[result.name] || 'Guardrail check for this session.';
    html += `
      <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid ${color}; border-radius: 8px; padding: 12px;" class="tooltip">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${status} ${result.name}</strong>
            <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">${result.message}</div>
          </div>
          <div style="font-size: 18px; color: ${color};">${result.score.toFixed(1)}%</div>
        </div>
        <span class="tooltiptext" style="width: 300px; white-space: normal;">${explanation}</span>
      </div>
    `;
  }
  
  html += `</div>`;
  container.innerHTML = html;
  resultsDiv.classList.remove('hidden');
}

function displayGuardrailsBatchResults(result) {
  const container = document.getElementById('guardrails-content');
  const resultsDiv = document.getElementById('guardrails-results');
  
  const batch = result.batch_metrics;
  
  // Tooltip explanations for each metric
  const tooltips = {
    'Overall Score': 'Average score across all 7 guardrail checks (Safety, PII Protection, Medical Accuracy, Relevance, Coherence, Completeness, Efficiency). Higher is better - aim for 80%+.',
    'Passed Rate': 'Percentage of sessions that passed at least 70% of guardrail checks. Indicates overall system quality and reliability.',
    'Total Sessions': 'Total number of chat sessions evaluated in this batch.',
    'Safety': 'Measures safety checks (harmful content detection) and PII protection (data privacy). Critical for healthcare - should be 100%.',
    'Accuracy': 'Measures medical language appropriateness and ensures the bot avoids making guarantees. Should be 85%+ for healthcare applications.',
    'Quality': 'Combined score for Relevance (response relevance to queries), Coherence (logical flow), and Completeness (information completeness). Target: 75%+.',
    'Efficiency': 'Measures conversation efficiency based on turn count. Lower turn counts for completed sessions = higher efficiency. Target: 70%+.'
  };
  
  let html = `
    <h4>Batch Guardrails Summary</h4>
    <div class="kpis">
      <div class="kpi tooltip">
        <div class="kpi-label">Overall Score</div>
        <div class="kpi-value">${batch.overall_score.toFixed(1)}%</div>
        <span class="tooltiptext">${tooltips['Overall Score']}</span>
      </div>
      <div class="kpi tooltip">
        <div class="kpi-label">Passed Rate</div>
        <div class="kpi-value">${batch.passed_rate.toFixed(1)}%</div>
        <span class="tooltiptext">${tooltips['Passed Rate']}</span>
      </div>
      <div class="kpi tooltip">
        <div class="kpi-label">Total Sessions</div>
        <div class="kpi-value">${batch.total_sessions}</div>
        <span class="tooltiptext">${tooltips['Total Sessions']}</span>
      </div>
    </div>
    
    <h4>Category Averages</h4>
    <div class="kpis">
  `;
  
  for (const [category, score] of Object.entries(batch.category_scores)) {
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    const tooltipText = tooltips[categoryName] || `Average score for ${categoryName} category guardrails.`;
    html += `
      <div class="kpi tooltip">
        <div class="kpi-label">${categoryName}</div>
        <div class="kpi-value">${score.toFixed(1)}%</div>
        <span class="tooltiptext">${tooltipText}</span>
      </div>
    `;
  }
  
  html += `</div>`;
  container.innerHTML = html;
  resultsDiv.classList.remove('hidden');
}

// Experiment functions
async function setBaseline() {
  if (!window.currentBatchAnalysis) {
    alert('Please analyze batch data first to set baseline');
    return;
  }
  
  const analysis = window.currentBatchAnalysis;
  
  // Get guardrails data if available
  let guardrailScores = {};
  let overallGuardrailScore = 0.0;
  
  try {
    const guardrailsResponse = await fetch('http://localhost:8000/guardrails/evaluate_batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatlogs: currentBatchData })
    });
    
    if (guardrailsResponse.ok) {
      const guardrailsData = await guardrailsResponse.json();
      guardrailScores = guardrailsData.batch_metrics.category_scores;
      overallGuardrailScore = guardrailsData.batch_metrics.overall_score;
    }
  } catch (e) {
    console.log('Could not fetch guardrails data');
  }
  
  const baselineData = {
    pipeline_version: 'v1.0.0',
    changes: [{
      change_id: 'baseline_1',
      timestamp: new Date().toISOString(),
      description: 'Initial baseline measurement',
      category: 'baseline',
      details: {}
    }],
    guardrail_scores: guardrailScores,
    overall_guardrail_score: overallGuardrailScore,
    completion_rate: analysis.successRate || analysis.conversionRate || 0,
    avg_turns: parseFloat(analysis.avgTurns) || 0,
    sentiment_rate: analysis.sentimentRate || 0,
    efficiency_score: analysis.rubricScores?.efficiency || 0,
    session_count: analysis.totalSessions || 0,
    notes: 'Baseline performance measurement'
  };
  
  try {
    const response = await fetch('http://localhost:8000/experiments/baseline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(baselineData)
    });
    
    if (response.ok) {
      const result = await response.json();
      alert('Baseline set successfully!');
      loadExperiments();
    } else {
      alert('Error setting baseline');
    }
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

async function createExperiment() {
  const pipelineVersion = prompt('Enter pipeline version (e.g., v1.1.0):', 'v1.1.0');
  if (!pipelineVersion) return;
  
  const changeDescription = prompt('Describe the change made:');
  if (!changeDescription) return;
  
  const changeCategory = prompt('Enter category (prompt_engineering, guardrails, response_format, knowledge_base):', 'prompt_engineering');
  
  if (!window.currentBatchAnalysis) {
    alert('Please analyze batch data first');
    return;
  }
  
  const analysis = window.currentBatchAnalysis;
  
  // Get guardrails data
  let guardrailScores = {};
  let overallGuardrailScore = 0.0;
  
  try {
    const guardrailsResponse = await fetch('http://localhost:8000/guardrails/evaluate_batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatlogs: currentBatchData })
    });
    
    if (guardrailsResponse.ok) {
      const guardrailsData = await guardrailsResponse.json();
      guardrailScores = guardrailsData.batch_metrics.category_scores;
      overallGuardrailScore = guardrailsData.batch_metrics.overall_score;
    }
  } catch (e) {
    console.log('Could not fetch guardrails data');
  }
  
  const experimentData = {
    pipeline_version: pipelineVersion,
    changes: [{
      change_id: `change_${Date.now()}`,
      timestamp: new Date().toISOString(),
      description: changeDescription,
      category: changeCategory,
      details: {}
    }],
    guardrail_scores: guardrailScores,
    overall_guardrail_score: overallGuardrailScore,
    completion_rate: analysis.successRate || analysis.conversionRate || 0,
    avg_turns: parseFloat(analysis.avgTurns) || 0,
    sentiment_rate: analysis.sentimentRate || 0,
    efficiency_score: analysis.rubricScores?.efficiency || 0,
    session_count: analysis.totalSessions || 0,
    notes: prompt('Additional notes (optional):') || '',
    trade_offs: []
  };
  
  try {
    const response = await fetch('http://localhost:8000/experiments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(experimentData)
    });
    
    if (response.ok) {
      const result = await response.json();
      alert('Experiment created successfully!');
      loadExperiments();
    } else {
      alert('Error creating experiment');
    }
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

async function loadExperiments() {
  try {
    const response = await fetch('http://localhost:8000/experiments/list');
    
    if (response.ok) {
      const data = await response.json();
      displayExperiments(data);
    } else {
      alert('Error loading experiments');
    }
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

function displayExperiments(data) {
  const container = document.getElementById('experiments-content');
  
  let html = '';
  
  if (data.baseline) {
    html += `
      <h4>📊 Baseline Experiment</h4>
      <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <div><strong>ID:</strong> ${data.baseline.experiment_id}</div>
        <div><strong>Timestamp:</strong> ${new Date(data.baseline.timestamp).toLocaleString()}</div>
        <div><strong>Pipeline Version:</strong> ${data.baseline.pipeline_version}</div>
        <div class="kpis" style="margin-top: 12px;">
          <div class="kpi">
            <div class="kpi-label">Guardrail Score</div>
            <div class="kpi-value">${data.baseline.overall_guardrail_score.toFixed(1)}%</div>
          </div>
          <div class="kpi">
            <div class="kpi-label">Completion Rate</div>
            <div class="kpi-value">${data.baseline.completion_rate.toFixed(1)}%</div>
          </div>
          <div class="kpi">
            <div class="kpi-label">Avg Turns</div>
            <div class="kpi-value">${data.baseline.avg_turns.toFixed(1)}</div>
          </div>
        </div>
      </div>
    `;
  }
  
  if (data.experiments && data.experiments.length > 0) {
    html += `<h4>🧪 Experiments (${data.experiments.length})</h4>`;
    
    for (const exp of data.experiments) {
      const improvements = exp.improvement || {};
      let improvementHtml = '';
      
      for (const [metric, change] of Object.entries(improvements)) {
        const sign = change > 0 ? '+' : '';
        const color = change > 0 ? '#10b981' : change < 0 ? '#ef4444' : '#94a3b8';
        improvementHtml += `<span style="color: ${color}; margin-right: 8px;">${metric}: ${sign}${change.toFixed(2)}</span>`;
      }
      
      html += `
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 12px;">
          <div><strong>ID:</strong> ${exp.experiment_id}</div>
          <div><strong>Version:</strong> ${exp.pipeline_version}</div>
          <div><strong>Timestamp:</strong> ${new Date(exp.timestamp).toLocaleString()}</div>
          <div><strong>Changes:</strong> ${exp.changes.map(c => c.description).join(', ')}</div>
          <div class="kpis" style="margin-top: 12px;">
            <div class="kpi">
              <div class="kpi-label">Guardrail Score</div>
              <div class="kpi-value">${exp.overall_guardrail_score.toFixed(1)}%</div>
            </div>
            <div class="kpi">
              <div class="kpi-label">Completion Rate</div>
              <div class="kpi-value">${exp.completion_rate.toFixed(1)}%</div>
            </div>
          </div>
          ${improvementHtml ? `<div style="margin-top: 8px;"><strong>Improvements:</strong> ${improvementHtml}</div>` : ''}
          ${exp.notes ? `<div style="margin-top: 8px; color: #94a3b8;"><em>${exp.notes}</em></div>` : ''}
        </div>
      `;
    }
  } else {
    html += '<div style="color: #94a3b8;">No experiments yet. Create one to start tracking improvements.</div>';
  }
  
  container.innerHTML = html;
}

async function generateReport() {
  try {
    // Get experiments data
    const experimentsResponse = await fetch('http://localhost:8000/experiments/list');
    if (!experimentsResponse.ok) {
      alert('Error loading experiments');
      return;
    }
    
    const experimentsData = await experimentsResponse.json();
    
    if (!experimentsData.baseline) {
      alert('Please set a baseline first');
      return;
    }
    
    const reportData = {
      guardrails_config: {
        description: "LLM Guardrails for Healthcare Chatbot",
        categories: ["safety", "accuracy", "quality", "efficiency"]
      },
      baseline_experiment: experimentsData.baseline,
      experiments: experimentsData.experiments || [],
      pipeline_description: "Healthcare Chatbot Evaluation Framework with LLM Guardrails and Experimentation"
    };
    
    const response = await fetch('http://localhost:8000/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    
    if (response.ok) {
      const report = await response.json();
      
      // Display report
      const container = document.getElementById('experiments-content');
      let html = '<h4>📄 Final Report Generated</h4>';
      html += '<div style="background: rgba(15, 23, 42, 0.5); border: 1px solid var(--border); border-radius: 8px; padding: 16px; max-height: 600px; overflow-y: auto;">';
      html += `<pre style="color: #f1f5f9; white-space: pre-wrap;">${JSON.stringify(report, null, 2)}</pre>`;
      html += '</div>';
      html += '<button onclick="exportReport()" style="margin-top: 16px;">💾 Export Report</button>';
      container.innerHTML = html;
      
      // Store report for export
      window.currentReport = report;
      window.currentReportData = reportData;
    } else {
      alert('Error generating report');
    }
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

async function exportReport() {
  if (!window.currentReportData) {
    alert('Please generate a report first');
    return;
  }
  
  try {
    // Export as JSON
    const jsonResponse = await fetch('http://localhost:8000/reports/export_json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(window.currentReport)
    });
    
    if (jsonResponse.ok) {
      const blob = await jsonResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'final_report.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
    
    // Export as Markdown
    const mdResponse = await fetch('http://localhost:8000/reports/export_markdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(window.currentReport)
    });
    
    if (mdResponse.ok) {
      alert('Report exported successfully! Check your downloads folder.');
    }
  } catch (e) {
    alert('Error exporting report: ' + e.message);
  }
}

// Initialize
switchView('single');

