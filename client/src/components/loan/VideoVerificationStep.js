import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Button, Paper, CircularProgress, 
  LinearProgress, Alert
} from '@mui/material';
import { 
  Videocam, CheckCircle, MicOff, Mic 
} from '@mui/icons-material';
import Webcam from 'react-webcam';

const VideoVerificationStep = ({ loanId, onComplete }) => {
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
  const [recordingTime, setRecordingTime] = useState(0);
  const [maxRecordingTime] = useState(30); // 30 seconds max
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [verificationResults, setVerificationResults] = useState({});
  const [overallStatus, setOverallStatus] = useState('pending'); // pending, in-progress, completed, failed
  
  // Load session data
  useEffect(() => {
    const initializeVerification = async () => {
      try {
        setLoading(true);
        
        // Mock data for demo
        const mockSession = {
          _id: 'demo-session-' + Date.now(),
          status: 'in-progress',
          questions: [
            {
              questionId: 'q1',
              questionText: 'Please state your full name and date of birth',
              videoPromptUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-talking-through-a-video-call-598-large.mp4',
              isAnswered: false
            },
            {
              questionId: 'q2',
              questionText: 'What is your current home address?',
              videoPromptUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-talking-through-a-video-call-575-large.mp4',
              isAnswered: false
            },
            {
              questionId: 'q3',
              questionText: 'Can you show your Aadhaar card to the camera?',
              videoPromptUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-having-a-video-call-600-large.mp4',
              isAnswered: false
            }
          ]
        };
        
        setSessionId(mockSession._id);
        setOverallStatus('in-progress');
        setQuestions(mockSession.questions);
      } catch (err) {
        console.error("Error initializing video verification:", err);
        setError("Failed to initialize video verification. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    initializeVerification();
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
      // Default to a fallback video if URL is missing or invalid
      if (!questions[currentQuestionIndex]?.videoPromptUrl) {
        console.log('No video URL found, using fallback');
        aiVideoRef.current.src = 'https://assets.mixkit.co/videos/preview/mixkit-woman-talking-through-a-video-call-598-large.mp4';
      }
      
      aiVideoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
        // Auto-advance if video can't play
        handleQuestionVideoEnded();
      });
      
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
    
    setRecordingStatus('processing');
    
    try {
      // Demo mock verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
        setOverallStatus('completed');
        setVerificationProgress(100);
        if (onComplete) {
          onComplete();
        }
      }
    } catch (err) {
      console.error("Error submitting video response:", err);
      setError("Failed to submit your response. Please try again.");
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
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Initializing video verification...
        </Typography>
      </Box>
    );
  }
  
  if (overallStatus === 'completed') {
    return (
      <Box sx={{ py: 2 }}>
        <Paper sx={{ p: 3, textAlign: 'center', mb: 3 }}>
          <CheckCircle color="success" sx={{ fontSize: 60 }} />
          <Typography variant="h5" sx={{ mt: 2 }}>
            Video Verification Complete
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Thank you for completing the verification process.
          </Typography>
        </Paper>
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          onClick={onComplete}
        >
          Continue
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Video Verification
        </Typography>
        <Typography variant="body1" paragraph>
          Please answer the following questions. Your responses will be recorded and verified.
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <LinearProgress 
            variant="determinate" 
            value={verificationProgress} 
            sx={{ height: 8, borderRadius: 5 }}
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
          
          {recordingStatus === 'completed' && (
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
            </Box>
          )}
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        )}
      </Paper>
    </Box>
  );
};

export default VideoVerificationStep;