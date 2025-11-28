# LLM Guardrails and Experimentation Framework - User Guide

This guide explains how to use the new guardrails and experimentation features added to your Healthcare Chatbot Evaluation Framework.

## Overview

Your professor requested the following features to be added:

1. **Step 2:** Setup LLM guardrails to measure different parts of the workflow
2. **Step 3:** Build your LLM/AI pipeline to attempt to achieve the goal
3. **Step 4:** Measure the pipeline baseline performance with the guardrails
4. **Step 5:** Make independent attempts to change mechanisms in your workflow to improve the performance of the guardrails. Document what changes you've made that yields what change in performance (positive or negative), and if there's any trade-off.
5. **Step 6:** Document all of the above and put in your final report.

## Features Added

### 1. LLM Guardrails System (`backend/guardrails.py`)

The guardrails system measures 7 different aspects of your chatbot workflow:

- **Safety Check**: Detects harmful content, self-harm indicators
- **PII Protection**: Prevents leakage of personally identifiable information
- **Medical Accuracy**: Ensures appropriate medical language and avoids guarantees
- **Relevance Check**: Measures if bot responses are relevant to user queries
- **Coherence Check**: Ensures logical flow and consistency
- **Completeness Check**: Verifies bot provides complete information
- **Efficiency Check**: Measures conversation efficiency and turn count

**Category Groupings:**
- **Safety**: Safety Check + PII Protection
- **Accuracy**: Medical Accuracy
- **Quality**: Relevance + Coherence + Completeness
- **Efficiency**: Efficiency Check

### 2. Experimentation Framework (`backend/experiments.py`)

Tracks:
- Baseline performance measurements
- Pipeline changes and iterations
- Performance improvements/degradations
- Trade-offs between different metrics
- Comparison between experiments

### 3. Reporting System (`backend/reporting.py`)

Generates comprehensive reports including:
- Guardrails setup documentation
- Pipeline implementation details
- Baseline performance metrics
- All iterations and their results
- Performance analysis and recommendations

## How to Use

### Step 1: Start the Backend

```bash
cd backend
python main.py
```

The API will run on `http://localhost:8000`

### Step 2: Evaluate Guardrails

#### For a Single Session:
1. Go to the **Guardrails** tab in the frontend
2. First, analyze a single session in the **Single Session** tab
3. Click **"Evaluate Single Session"** in the Guardrails tab
4. View the guardrail results showing:
   - Overall guardrail score
   - Category scores (Safety, Accuracy, Quality, Efficiency)
   - Individual guardrail pass/fail status

#### For Batch Data:
1. Analyze batch data in the **Batch Analysis** tab
2. Go to the **Guardrails** tab
3. Click **"Evaluate Batch"**
4. View batch-level guardrail metrics

### Step 3: Set Baseline Performance

1. Analyze your batch data first (in Batch Analysis tab)
2. Go to the **Experiments** tab
3. Click **"Set Baseline"**
4. This records your initial performance with guardrails

The baseline includes:
- Guardrail scores (overall and by category)
- Completion rate
- Average turns
- Sentiment rate
- Efficiency score

### Step 4: Make Changes and Create Experiments

After making changes to your pipeline (e.g., prompt engineering, response format, knowledge base updates):

1. Analyze the new batch data with your changes
2. Go to the **Experiments** tab
3. Click **"Create Experiment"**
4. Enter:
   - Pipeline version (e.g., v1.1.0)
   - Description of changes made
   - Category of change
   - Optional notes
5. The system will:
   - Calculate guardrail scores for the new version
   - Compare against baseline
   - Show improvements/degradations
   - Track trade-offs

### Step 5: View All Experiments

Click **"View All Experiments"** to see:
- Baseline experiment
- All iterations with their performance metrics
- Improvements compared to baseline
- Notes and trade-offs

### Step 6: Generate Final Report

1. Click **"Generate Report"** in the Experiments tab
2. The system generates a comprehensive report including:
   - Guardrails setup documentation
   - Pipeline implementation
   - Baseline performance
   - All iterations and changes
   - Performance analysis
   - Recommendations

3. Click **"Export Report"** to download:
   - JSON format (`final_report.json`)
   - Markdown format (`final_report.md`)

## API Endpoints

### Guardrails
- `POST /guardrails/evaluate` - Evaluate guardrails for single session
- `POST /guardrails/evaluate_batch` - Evaluate guardrails for batch

### Experiments
- `POST /experiments/baseline` - Set baseline performance
- `POST /experiments/create` - Create new experiment
- `GET /experiments/list` - List all experiments
- `GET /experiments/{experiment_id}` - Get specific experiment
- `GET /experiments/report` - Get experiment report

### Reporting
- `POST /reports/generate` - Generate final report
- `POST /reports/export_json` - Export report as JSON
- `POST /reports/export_markdown` - Export report as Markdown

## Example Workflow

1. **Initial Setup:**
   - Load your initial batch of chat sessions
   - Analyze in Batch Analysis tab
   - Set baseline in Experiments tab

2. **Make First Change:**
   - Update your chatbot's prompt engineering
   - Test with new batch of sessions
   - Analyze new batch
   - Create experiment: "Improved prompt clarity for appointment booking"

3. **Make Second Change:**
   - Update knowledge base with more FAQs
   - Test with new batch
   - Analyze new batch
   - Create experiment: "Expanded knowledge base coverage"

4. **Compare Results:**
   - View all experiments
   - See which changes improved guardrail scores
   - Identify trade-offs (e.g., better accuracy but slower efficiency)

5. **Generate Report:**
   - Generate final report
   - Export for submission
   - Include in your final project documentation

## Understanding Guardrail Scores

- **Overall Score**: Average of all 7 guardrail checks (0-100)
- **Category Scores**: 
  - Safety: Average of Safety + PII Protection
  - Accuracy: Medical Accuracy score
  - Quality: Average of Relevance + Coherence + Completeness
  - Efficiency: Efficiency Check score

**Good Scores:**
- Overall: > 80%
- Safety: > 90% (critical for healthcare)
- Accuracy: > 85%
- Quality: > 75%
- Efficiency: > 70%

## Tips for Success

1. **Document Changes Clearly**: When creating experiments, be specific about what changed
2. **Track Trade-offs**: Note if improving one metric hurts another
3. **Iterate Gradually**: Make one change at a time to understand impact
4. **Use Consistent Test Data**: Use similar batch sizes for fair comparison
5. **Review Guardrail Failures**: Focus on improving failed guardrails first

## Files Created

- `backend/guardrails.py` - Guardrails implementation
- `backend/experiments.py` - Experimentation framework
- `backend/reporting.py` - Report generation
- Updated `backend/main.py` - API endpoints
- Updated `frontend/index.html` - UI for guardrails and experiments
- Updated `frontend/app.js` - Frontend functions

## Next Steps

1. Test the guardrails with your existing chat data
2. Set your baseline performance
3. Make iterative improvements to your chatbot
4. Track each change as an experiment
5. Generate your final report for submission

Good luck with your project! 🚀

