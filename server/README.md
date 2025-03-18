# AI-Bank Manager

An AI-powered bank management system built on the MERN stack with Python AI services.

## Features

- OTP-based authentication
- AI video-based interaction system
- Speech-to-text & NLP processing
- Document upload & verification
- Loan eligibility & decision system
- Loan status & application tracking
- AI-powered financial insights
- Multi-language support
- Co-applicant & guarantor system

## Tech Stack

- **Frontend**: React, Redux, Material UI
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **AI Services**: Python (FastAPI)
- **Authentication**: JWT, OTP

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   - Frontend: `cd client && npm install`
   - Backend: `cd server && npm install`
   - Python services: `cd python_services && source venv/bin/activate && pip install -r requirements.txt`
3. Set up environment variables
4. Run the development servers:
   - Frontend: `cd client && npm start`
   - Backend: `cd server && npm run dev`
   - Python services: `cd python_services && uvicorn main:app --reload`

## Project Structure

- `client/` - React frontend
- `server/` - Node.js backend
- `python_services/` - Python AI services
