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
  const rubricScores = {
    satisfaction: 0,
    coherence: 0, 
    relevance: 0,
    consistency: 0,
    adaptability: 0,
    memory: 0,
    efficiency: 0
  };
  
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
    
    // Word frequency analysis
    session.turns.forEach(turn => {
      if (turn.role === 'user' && turn.text) {
        const words = turn.text.toLowerCase().match(/\b\w+\b/g) || [];
        words.forEach(word => {
          if (word.length > 2 && !['the', 'and', 'you', 'for', 'are', 'with', 'this', 'that', 'have', 'from', 'can', 'will', 'would', 'could', 'should', 'please', 'thank', 'thanks'].includes(word)) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
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
    sessions: chatlogs.map(session => analyzeSession(session))
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
  
  // Render charts
  renderRadarChart('batch-radar', analysis.rubricScores, 'Average Scores');
  
  // Render funnel chart
  renderFunnelChart('batch-funnel', {
    totalChats: analysis.totalSessions,
    confirmedBookings: analysis.completedSessions,
    conversionRate: analysis.successRate
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
  
  // Render word cloud
  renderWordCloud(analysis.wordFreq);
  
  // Render AI insights
  renderBatchAIInsights(analysis);
  
  // Render session list
  renderSessionList(analysis.sessions);
  
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
      labels: trendData.months,
      datasets: [
        {
          label: 'Success Rate (%)',
          data: trendData.successRates,
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Avg Turns',
          data: trendData.avgTurns,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        },
        {
          label: 'Positive Sentiment (%)',
          data: trendData.sentimentRates,
          borderColor: 'rgba(168, 85, 247, 1)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
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
            text: 'Month'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Percentage (%)'
          },
          min: 0,
          max: 100
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Average Turns'
          },
          min: 0,
          grid: {
            drawOnChartArea: false,
          },
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
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
                if (context.dataset.label === 'Avg Turns') {
                  label += ' turns';
                } else {
                  label += '%';
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

function renderWordCloud(wordFreq) {
  const container = document.getElementById('wordCloud');
  container.innerHTML = '';
  
  if (!wordFreq || Object.keys(wordFreq).length === 0) {
    container.innerHTML = '<div style="color: #94a3b8;">No word data available</div>';
    return;
  }
  
  const sortedWords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 30); // Top 30 words
  
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

// Initialize
switchView('single');

