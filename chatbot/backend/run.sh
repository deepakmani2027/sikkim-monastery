#!/bin/bash
cd /Users/deepakmani664/Desktop/sikkim-monastery-c7be94585accb2cec9b4e7ee17b5845ad677e7ed/chatbot/backend
export PYTHONPATH=/Users/deepakmani664/Desktop/sikkim-monastery-c7be94585accb2cec9b4e7ee17b5845ad677e7ed/chatbot/backend:$PYTHONPATH
/Users/deepakmani664/Desktop/sikkim-monastery-c7be94585accb2cec9b4e7ee17b5845ad677e7ed/chatbot/backend/venv/bin/python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
