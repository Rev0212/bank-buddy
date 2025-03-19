from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import os

# Create FastAPI app
app = FastAPI(
    title="AI-Bank Manager API",
    description="API for AI-powered banking services",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class SentimentResponse(BaseModel):
    score: float
    magnitude: float
    sentiment: str

class DocumentVerificationResponse(BaseModel):
    verified: bool
    confidence: float
    extracted_data: dict

class SpeechToTextResponse(BaseModel):
    text: str
    confidence: float

# Routes
@app.get("/")
def read_root():
    return {"message": "Welcome to AI-Bank Manager API"}

@app.post("/api/speech-to-text", response_model=SpeechToTextResponse)
async def speech_to_text(audio_file: UploadFile = File(...)):
    # This is a placeholder for actual speech-to-text processing
    # In a real app, you would process the audio file using Google Speech API
    
    # Placeholder response
    return {
        "text": "This is a placeholder for the transcribed text",
        "confidence": 0.95
    }

@app.post("/api/analyze-sentiment", response_model=SentimentResponse)
async def analyze_sentiment(text: str = Form(...)):
    # This is a placeholder for actual sentiment analysis
    # In a real app, you would process the text using Google NLP API
    
    # Placeholder response
    return {
        "score": 0.8,
        "magnitude": 0.6,
        "sentiment": "positive"
    }

# Enhance the document verification endpoint

@app.post("/api/verify-document", response_model=DocumentVerificationResponse)
async def verify_document(document: UploadFile = File(...), doc_type: str = Form(...)):
    # Save the uploaded file temporarily
    file_location = f"/tmp/{document.filename}"
    with open(file_location, "wb") as file_object:
        file_object.write(await document.read())
    
    # In a real app, this would use OCR libraries like Tesseract or cloud APIs
    # For demo, we'll simulate different responses based on document type
    
    verified = True
    confidence = 0.95
    extracted_data = {}
    
    if doc_type == "aadhaar_card":
        # Simulate Aadhaar card OCR
        extracted_data = {
            "name": "Rishi Anand",
            "aadhaar_number": "3318-7769-4555",
            "dob": "07-10-2004",
            "address": "123 Main St, Bangalore, Karnataka",
            "gender": "Male"
        }
    
    elif doc_type == "pan_card":
        # Simulate PAN card OCR
        extracted_data = {
            "name": "Rishi Anand",
            "pan_number": "ABCDE1234F",
            "dob": "07-10-2004",
            "father_name": "Anand"
        }
    
    elif doc_type == "bank_statement":
        # Simulate bank statement OCR
        extracted_data = {
            "account_holder": "Rishi Anand",
            "account_number": "XXXXXXXX5678",
            "bank_name": "HDFC Bank",
            "branch": "Koramangala Branch",
            "average_balance": "125000",
            "statement_period": "Jan-Mar 2025"
        }
    
    elif doc_type == "photo_id":
        # Simulate generic photo ID OCR
        extracted_data = {
            "name": "Rishi Anand",
            "id_type": "Voter ID",
            "id_number": "ABC1234567",
            "issue_date": "01-01-2020",
            "valid_until": "01-01-2030"
        }
    
    # Clean up the temporary file
    os.remove(file_location)
    
    return {
        "verified": verified,
        "confidence": confidence,
        "extracted_data": extracted_data
    }

# Add this new endpoint after your existing endpoints

@app.post("/api/video-response-analysis")
async def analyze_video_response(video_file: UploadFile = File(...), document_data: str = Form(...)):
    """
    Process video response:
    1. Extract audio from video
    2. Convert speech to text
    3. Compare with document data
    """
    import json
    
    # Save the uploaded file temporarily
    file_location = f"/tmp/{video_file.filename}"
    with open(file_location, "wb") as file_object:
        file_object.write(await video_file.read())
    
    # In a real implementation:
    # 1. Extract audio from video file
    # 2. Use speech-to-text API
    # 3. NLP to extract entities
    # 4. Compare with document data
    
    # Parse document data
    doc_data = json.loads(document_data)
    
    # Mock response based on the question
    question_type = video_file.filename.split('-')[0] if '-' in video_file.filename else "generic"
    
    # Simulate different transcriptions based on question type
    transcribed_text = ""
    verified = False
    confidence = 0.0
    matched_document = None
    
    if question_type == "identity":
        transcribed_text = "My name is John Doe and I was born on January 1st, 1990"
        if "aadhaar_card" in doc_data and "name" in doc_data["aadhaar_card"]:
            # Check if name matches
            if "Rishi Anand".lower() in doc_data["aadhaar_card"]["name"].lower():
                verified = True
                confidence = 0.92
                matched_document = "aadhaar_card"
    
    elif question_type == "address":
        transcribed_text = "I live at 123 Main St in Bangalore, Karnataka"
        if "aadhaar_card" in doc_data and "address" in doc_data["aadhaar_card"]:
            # Check if address matches
            if "Bangalore".lower() in doc_data["aadhaar_card"]["address"].lower():
                verified = True
                confidence = 0.89
                matched_document = "aadhaar_card"
                
    elif question_type == "income":
        transcribed_text = "My monthly income is around 60,000 rupees"
        if "bank_statement" in doc_data and "average_balance" in doc_data["bank_statement"]:
            # Simple income verification logic
            try:
                avg_balance = float(doc_data["bank_statement"]["average_balance"])
                if avg_balance > 30000:  # Simple heuristic
                    verified = True
                    confidence = 0.85
                    matched_document = "bank_statement"
            except:
                verified = False
    
    else:
        # Generic response
        transcribed_text = "This is a sample response for testing purposes"
        verified = True
        confidence = 0.75
    
    # Clean up
    os.remove(file_location)
    
    # Return the analysis results
    return {
        "transcribedText": transcribed_text,
        "verified": verified,
        "confidence": confidence,
        "matchedDocument": matched_document
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)