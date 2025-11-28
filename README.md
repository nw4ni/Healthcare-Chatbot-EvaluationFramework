# Healthcare Chatbot Analytics Dashboard

A comprehensive analytics platform for evaluating healthcare chatbot performance with both single session and batch analysis capabilities.

## 🚀 Quick Start

### Option 1: Frontend Only (Self-contained)
1. Open `frontend/index.html` in your web browser
2. Use the "Load Example" buttons to test features
3. Upload your own JSON files for analysis

### Option 2: Full Stack (Backend + Frontend)
1. Install Python dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Start the backend server:
   ```bash
   python main.py
   ```

3. Open `frontend/index.html` in your web browser
4. The frontend will automatically connect to the backend API

## 📁 Project Structure

```
Healthcare-Analytics-Split/
├── backend/
│   ├── main.py              # FastAPI server with analysis endpoints
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── index.html          # Main dashboard interface
│   ├── styles.css          # Dark theme styling
│   └── app.js             # Frontend logic and chart rendering
└── README.md              # This file
```

## 🔍 Features

### Single Session Analysis
- **Detailed Metrics**: Session ID, completion status, turns count, overall score
- **Rubric Breakdown**: Radar chart showing satisfaction, coherence, relevance, consistency, adaptability, memory, efficiency
- **Session Metrics**: User sentiment, efficiency score, error count, out-of-scope queries
- **Conversation Timeline**: Visual timeline of user-bot interactions
- **AI Insights**: Deep analysis with root cause identification and strategic recommendations

### Batch Analysis
- **KPI Dashboard**: Task success rate, average conversation length, positive sentiment rate, overall score
- **Visual Analytics**: 
  - Rubric averages radar chart
  - Booking success funnel
  - Sentiment breakdown (positive/neutral/negative)
  - Session duration analysis (short/medium/long)
- **Word Cloud**: Common user terms from all sessions
- **AI System Insights**: Comprehensive analysis with correlations and strategic recommendations
- **Session List**: Click any session to drill down to individual analysis

### Advanced Features
- **Tooltips**: Hover explanations for all metrics and rubric categories
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Modern, professional interface
- **Sample Data**: 150+ realistic sessions for testing
- **Hybrid Architecture**: Works with or without backend server

## 📊 Sample Data

The dashboard includes realistic sample data with:
- **40% Successful completions** (various session lengths)
- **20% Abandoned sessions** (different abandonment patterns)
- **15% Error sessions** (invalid input handling)
- **10% Out-of-scope sessions** (capability limitations)
- **15% Negative sentiment sessions** (frustration patterns)

## 🔧 API Endpoints

When using the backend server:

- `GET /` - API health check
- `POST /evaluate` - Analyze single session
- `POST /evaluate_json` - Analyze single session from JSON
- `POST /batch` - Analyze multiple sessions
- `POST /batch_json` - Analyze batch from JSON
- `POST /upload` - Upload and analyze JSON file

## 🎯 Use Cases

### Healthcare Organizations
- Evaluate chatbot performance across different specialties
- Identify common user pain points and abandonment reasons
- Optimize conversation flows for better conversion rates
- Track sentiment trends and user satisfaction

### Product Teams
- A/B test different conversation approaches
- Measure the impact of bot improvements
- Identify knowledge gaps and capability limitations
- Generate insights for bot training and development

### Analytics Teams
- Create comprehensive performance reports
- Track KPIs over time
- Identify patterns in user behavior
- Generate actionable recommendations

## 🛠️ Technical Details

### Frontend
- **HTML5**: Semantic structure with accessibility features
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript**: ES6+ with Chart.js for visualizations
- **Chart.js**: Radar charts, bar charts, word clouds
- **Responsive**: Mobile-first design approach

### Backend
- **FastAPI**: Modern Python web framework
- **Pydantic**: Data validation and serialization
- **CORS**: Cross-origin resource sharing enabled
- **JSON**: RESTful API with JSON responses

### Analysis Engine
- **Sentiment Analysis**: Keyword-based sentiment detection
- **Rubric Scoring**: Multi-dimensional evaluation framework
- **Word Frequency**: Natural language processing for insights
- **Statistical Analysis**: Correlation and trend analysis

## 📈 Metrics Explained

### Rubric Categories
- **Satisfaction**: How well the bot met user needs
- **Coherence**: Logical flow and consistency of responses
- **Relevance**: How well responses address user queries
- **Consistency**: Uniform behavior and tone throughout
- **Adaptability**: Ability to handle different user inputs
- **Memory**: Retention of context across conversation
- **Efficiency**: Achieving goals with minimal turns

### Session Types
- **Short (1-4 turns)**: Quick, efficient interactions
- **Medium (5-8 turns)**: Standard booking conversations
- **Long (9+ turns)**: Complex or problematic sessions

### Sentiment Analysis
- **Positive**: Users expressing satisfaction, thanks, approval
- **Neutral**: Users maintaining neutral tone throughout
- **Negative**: Users expressing frustration, confusion, dissatisfaction

## 🔮 Future Enhancements

- **Time-series Analysis**: Track performance trends over time
- **Knowledge Base Optimization**: Identify gaps and suggest improvements
- **Enhanced Word Cloud**: Filter by time periods, sentiment, or outcomes
- **Continuous Learning**: Track out-of-scope questions for capability expansion
- **Export Features**: PDF reports, CSV data export
- **Real-time Monitoring**: Live dashboard for ongoing conversations

## 🤝 Contributing

This is a demonstration project showcasing healthcare chatbot analytics capabilities. Feel free to extend and customize for your specific needs.

## 📄 License

This project is provided as-is for demonstration purposes.

