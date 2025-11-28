#!/bin/bash
echo "Starting Healthcare Chatbot Analytics Backend..."
echo ""
echo "Installing dependencies..."
pip install -r requirements.txt
echo ""
echo "Starting FastAPI server on http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""
python main.py

