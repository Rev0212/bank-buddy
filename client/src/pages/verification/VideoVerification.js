import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Box, Typography, Paper, Button, Stepper, 
  Step, StepLabel, CircularProgress, LinearProgress, 
  Alert, Dialog, DialogContent, IconButton, Chip,
  Grid // Add this import
} from '@mui/material';
import {
  Videocam, CheckCircle, Cancel, ArrowForward,
  MicOff, Mic, Close, Visibility, VisibilityOff,
  Help, Info
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';

const VideoVerification = () => {
  const { id: loanId } = useParams();
  const navigate = useNavigate();
  
  // Refs
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const aiVideoRef = useRef(null);
  
  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingStatus, setRecordingStatus] = useState('idle'); // idle, countdown, recording, processing, completed
  const [countdown, setCountdown] = useState(3);
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [maxRecordingTime] = useState(30); // 30 seconds max
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [verificationResults, setVerificationResults] = useState({});
  const [overallStatus, setOverallStatus] = useState('pending'); // pending, in-progress, completed, failed
  
  // Load document data and initialize session
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch uploaded document data
        const documentResponse = await axios.get(`/api/document/loan/${loanId}`);
        const docData = {};
        
        documentResponse.data.data.forEach(doc => {
          docData[doc.documentType.toLowerCase().replace(' ', '_')] = doc.verificationDetails?.aiVerificationDetails?.extractedInformation;
        });
        
        setDocumentData(docData);
        
        // 2. Initialize or resume video session
        let session;
        try {
          // Try to get existing session
          const sessionResponse = await axios.get(`/api/video-interaction/loan/${loanId}`);
          session = sessionResponse.data.data;
          setSessionId(session._id);
          
          // Check if session is completed
          if (session.status === 'completed') {
            setOverallStatus('completed');
            setVerificationProgress(100);
          } else {
            setOverallStatus('in-progress');
            
            // Find first unanswered question
            const nextIndex = session.questions.findIndex(q => !q.isAnswered);
            setCurrentQuestionIndex(nextIndex >= 0 ? nextIndex : 0);
            setVerificationProgress((nextIndex / session.questions.length) * 100);
          }
        } catch (err) {
          // Create new session
          const newSessionResponse = await axios.post('/api/video-interaction', { loanId });
          session = newSessionResponse.data.data;
          setSessionId(session._id);
          setOverallStatus('in-progress');
        }
        
        setQuestions(session.questions);
        
      } catch (err) {
        console.error("Error initializing video verification:", err);
        setError("Failed to initialize video verification. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [loanId]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, [recordingTimer]);
  
  // Handle AI video ended event
  const handleQuestionVideoEnded = () => {
    setIsPlayingQuestion(false);
    startRecordingCountdown();
  };
  
  // Play the current question video
  const playQuestionVideo = () => {
    if (aiVideoRef.current) {
      aiVideoRef.current.play();
      setIsPlayingQuestion(true);
    }
  };
  
  // Start countdown before recording
  const startRecordingCountdown = () => {
    setRecordingStatus('countdown');
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Initialize and start recording
  const startRecording = () => {
    if (webcamRef.current && webcamRef.current.stream) {
      setRecordingStatus('recording');
      setIsRecording(true);
      setRecordedChunks([]);
      setRecordingTime(0);
      
      const stream = webcamRef.current.stream;
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });
      
      mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
      mediaRecorderRef.current.addEventListener('stop', handleRecordingStopped);
      mediaRecorderRef.current.start();
      
      // Set up timer
      const timer = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxRecordingTime) {
            stopRecording();
            return maxRecordingTime;
          }
          return prev + 1;
        });
      }, 1000);
      
      setRecordingTimer(timer);
    } else {
      setError("Cannot access camera or microphone. Please check permissions.");
    }
  };
  
  // Handle recorded video data
  const handleDataAvailable = (event) => {
    if (event.data && event.data.size > 0) {
      setRecordedChunks(prev => [...prev, event.data]);
    }
  };
  
  // Handle recording stopped
  const handleRecordingStopped = () => {
    setIsRecording(false);
    clearInterval(recordingTimer);
    setRecordingStatus('completed');
  };
  
  // Stop recording 
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };
  
  // Submit recorded answer
  const submitRecording = async () => {
    if (!recordedChunks.length) return;
    
    setIsSubmitting(true);
    setRecordingStatus('processing');
    
    try {
      // Create a blob from the recorded chunks
      const blob = new Blob(recordedChunks, {
        type: 'video/webm'
      });
      
      // Create FormData and append the video blob
      const formData = new FormData();
      formData.append('video', blob, 'response.webm');
      formData.append('questionId', questions[currentQuestionIndex].questionId);
      
      // Upload the video response
      const response = await axios.post(`/api/video-interaction/${sessionId}/answer`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Get the transcribed text from the response
      const transcribedText = response.data.data.transcribedText;
      
      // Update verification results
      setVerificationResults(prev => ({
        ...prev,
        [questions[currentQuestionIndex].questionId]: {
          text: transcribedText,
          verified: response.data.data.verified,
          confidence: response.data.data.confidence,
          matchedDocument: response.data.data.matchedDocument
        }
      }));
      
      // Update questions array to mark this one as answered
      setQuestions(prev => prev.map((q, idx) => 
        idx === currentQuestionIndex ? { ...q, isAnswered: true } : q
      ));
      
      // Move to the next question or complete
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setRecordingStatus('idle');
        setRecordedChunks([]);
        setVerificationProgress(((currentQuestionIndex + 1) / questions.length) * 100);
      } else {
        // Complete the verification process
        await axios.post(`/api/video-interaction/${sessionId}/complete`);
        setOverallStatus('completed');
        setVerificationProgress(100);
      }
      
    } catch (err) {
      console.error("Error submitting video response:", err);
      setError("Failed to submit your response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Retry recording
  const retryRecording = () => {
    setRecordedChunks([]);
    setRecordingStatus('idle');
    setRecordingTime(0);
  };
  
  // Get current question data
  const currentQuestion = questions[currentQuestionIndex] || {};
  
  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  // Navigate to next step after completion
  const handleComplete = () => {
    navigate(`/loan/${loanId}`);
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Initializing video verification...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button variant="contained" onClick={() => navigate(`/loan/${loanId}`)}>
          Return to Loan Details
        </Button>
      </Container>
    );
  }
  
  if (overallStatus === 'completed') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle color="success" sx={{ fontSize: 60 }} />
          <Typography variant="h4" sx={{ mt: 2 }}>
            Video Verification Complete
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, mb: 3 }}>
            Thank you for completing the video verification process. Your responses have been recorded.
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleComplete}
            startIcon={<ArrowForward />}
          >
            Continue to Loan Application
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Video Verification
        </Typography>
        <Typography variant="body1" paragraph>
          Please answer the following questions. Your responses will be recorded and verified against your documents.
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <LinearProgress 
            variant="determinate" 
            value={verificationProgress} 
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Typography>
            <Typography variant="body2">
              {Math.round(verificationProgress)}% Complete
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ mb: 3 }}>
              {recordingStatus === 'idle' && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Question: {currentQuestion.questionText}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Videocam />}
                    onClick={playQuestionVideo}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Play Question Video
                  </Button>
                </>
              )}
              
              {isPlayingQuestion && (
                <Box sx={{ position: 'relative', width: '100%', pt: '56.25%' }}>
                  <video
                    ref={aiVideoRef}
                    src={currentQuestion.videoPromptUrl}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    controls={false}
                    onEnded={handleQuestionVideoEnded}
                  />
                </Box>
              )}
              
              {recordingStatus === 'countdown' && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    p: 4 
                  }}
                >
                  <Typography variant="h2" color="primary">
                    {countdown}
                  </Typography>
                  <Typography variant="h6">
                    Recording will start in...
                  </Typography>
                </Box>
              )}
              
              {recordingStatus === 'recording' && (
                <>
                  <Box sx={{ position: 'relative', width: '100%', pt: '56.25%', mb: 2 }}>
                    <Webcam
                      audio={true}
                      ref={webcamRef}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        bottom: 10, 
                        left: 10, 
                        backgroundColor: 'rgba(255,0,0,0.7)', 
                        color: 'white', 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1, 
                        display: 'flex', 
                        alignItems: 'center' 
                      }}
                    >
                      <Mic sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        Recording {formatTime(recordingTime)} / {formatTime(maxRecordingTime)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<MicOff />}
                    onClick={stopRecording}
                    fullWidth
                  >
                    Stop Recording
                  </Button>
                </>
              )}
              
              {recordingStatus === 'completed' && !isSubmitting && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Review Your Response
                  </Typography>
                  
                  <Box sx={{ position: 'relative', width: '100%', pt: '56.25%', mb: 2 }}>
                    <video
                      ref={videoRef}
                      src={recordedChunks.length ? URL.createObjectURL(new Blob(recordedChunks, { type: 'video/webm' })) : ''}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      controls
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={retryRecording}
                    >
                      Record Again
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={submitRecording}
                    >
                      Submit Response
                    </Button>
                  </Box>
                </>
              )}
              
              {recordingStatus === 'processing' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                  <CircularProgress />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Processing your response...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We're transcribing and analyzing your answer
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default VideoVerification;