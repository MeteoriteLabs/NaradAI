#!/bin/bash
cd backend && python -m uvicorn main:app --reload --port 3001 --host 0.0.0.0
