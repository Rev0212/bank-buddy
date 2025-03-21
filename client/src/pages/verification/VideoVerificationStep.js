import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Box, Typography, Paper, Button, Stepper, 
  Step, StepLabel, CircularProgress, LinearProgress, 
  Alert, Grid
} from '@mui/material';
import {
  Videocam, CheckCircle, ArrowForward,
  MicOff, Mic
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

const VideoVerificationStep = () => {
  const { id: loanId } = useParams();
  const navigate = useNavigate();
  
  // Refs
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const questionVideoRef = useRef(null);
  const streamRef = useRef(null); // Add this ref to store the media stream
  
  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingStatus, setRecordingStatus] = useState('idle'); // idle, countdown, recording, review, processing
  const [countdown, setCountdown] = useState(3);
  const [recordingTime, setRecordingTime] = useState(0);
  const [maxRecordingTime] = useState(30); // 30 seconds max
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [overallStatus, setOverallStatus] = useState('pending'); // pending, in-progress, completed
  
  // Helper function to clean up camera resources
  const cleanupCameraResources = () => {
    // Clean up any existing streams
    if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.srcObject) {
      webcamRef.current.video.srcObject.getTracks().forEach(track => track.stop());
    }
  };
  
  // Initialize with questions from local videos folder
  useEffect(() => {
    // Mock questions with local video paths
    const mockQuestions = [
      {
        questionId: 'q1',
        questionText: 'Please state your full name and date of birth',
        videoUrl: `${process.env.REACT_APP_BASE_URL || ''}/videos/1.mp4`,
        isAnswered: false
      },
      {
        questionId: 'q2',
        questionText: 'What is your current home address?',
        videoUrl: `${process.env.REACT_APP_BASE_URL || ''}/videos/2.mp4`,
        isAnswered: false
      },
      {
        questionId: 'q3',
        questionText: 'Can you show your Aadhaar card to the camera?',
        videoUrl: `${process.env.REACT_APP_BASE_URL || ''}/videos/3.mp4`,
        isAnswered: false
      }
    ];
    
    setQuestions(mockQuestions);
    setOverallStatus('in-progress');
    setLoading(false);
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
      
      // Clean up the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      cleanupCameraResources();
    };
  }, [recordingTimer]);
  
  // Get current question
  const currentQuestion = questions[currentQuestionIndex] || {};
  
  // Format time helper (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  // Step 1: Play question video
const playQuestionVideo = () => {
  // First change state to render the video element
  setRecordingStatus('playing-video');
  
  // Use setTimeout to ensure the video element is rendered
  setTimeout(() => {
    if (questionVideoRef.current) {
      questionVideoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
        // Fallback if local video can't play
        handleVideoError(questionVideoRef.current);
      });
    }
  }, 100);
};
  // Handle video error
  const handleVideoError = (videoElement) => {
    console.log("Video error, using fallback");
    videoElement.src = "https://assets.mixkit.co/videos/preview/mixkit-woman-talking-through-a-video-call-598-large.mp4";
    videoElement.play().catch(e => {
      console.error("Fallback video also failed:", e);
      // Auto-advance if even fallback fails
      handleQuestionVideoEnded();
    });
  };
  
  // Handle video ended event
  const handleQuestionVideoEnded = () => {
    setRecordingStatus('countdown');
    startRecordingCountdown();
  };
  
  // Start countdown before recording
  const startRecordingCountdown = () => {
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
  
  // Step 2: Start recording
const startRecording = () => {
  setRecordingStatus('recording');
  setRecordingTime(0);
  setRecordedChunks([]);
  setError('');
  
  // Add delay to ensure webcam is initialized
  setTimeout(() => {
    if (!webcamRef.current) {
      setError('Camera not initialized. Please refresh and try again.');
      setRecordingStatus('idle');
      return;
    }
    
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: 1280,
        height: 720,
        facingMode: "user"
      }
    })
    .then(mediaStream => {
      console.log("Camera access granted, setting up recording");
      streamRef.current = mediaStream; // Use the ref instead of an undeclared variable
      
      // Ensure webcam ref is set properly
      if (webcamRef.current) {
        webcamRef.current.video.srcObject = mediaStream;
        console.log("Webcam video source set");
      } else {
        console.error("Webcam ref not available");
        throw new Error("Webcam reference not available");
      }
      
      // Determine supported MIME types
      let mimeType = null;
      const supportedTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
      ];
      
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          console.log(`Using MIME type: ${mimeType}`);
          break;
        }
      }
      
      const options = mimeType ? { mimeType } : {};
      
      try {
        // Create media recorder with explicit error handling
        const recorder = new MediaRecorder(mediaStream, options);
        mediaRecorderRef.current = recorder;
        
        // Set up event handlers for the recorder
        recorder.ondataavailable = (event) => {
          console.log(`Data available: ${event.data.size} bytes`);
          if (event.data && event.data.size > 0) {
            setRecordedChunks(prev => [...prev, event.data]);
          }
        };
        
        recorder.onstart = () => {
          console.log("MediaRecorder started");
        };
        
        recorder.onstop = () => {
          console.log("MediaRecorder stopped");
          setRecordingStatus('review');
        };
        
        recorder.onerror = (event) => {
          console.error("MediaRecorder error:", event.error);
          setError(`Recording error: ${event.error.message || 'Unknown error'}`);
        };
        
        // Start the recorder with a 500ms interval (more frequent chunks)
        recorder.start(500);
        console.log("MediaRecorder started recording");
        
        // Set up timer
        const timer = setInterval(() => {
          setRecordingTime(prev => {
            const newTime = prev + 1;
            console.log(`Recording time: ${newTime}s`);
            
            if (newTime >= maxRecordingTime) {
              clearInterval(timer);
              stopRecording();
              return maxRecordingTime;
            }
            return newTime;
          });
        }, 1000);
        
        setRecordingTimer(timer);
      } catch (err) {
        console.error("Error creating MediaRecorder:", err);
        setError(`MediaRecorder error: ${err.message || 'Unknown error'}`);
        setRecordingStatus('idle');
        
        // Clean up the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      }
    })
    .catch(err => {
      console.error("Error accessing media devices:", err);
      setError(`Camera access error: ${err.message || 'Unknown error'}`);
      setRecordingStatus('idle');
      
      // Clean up the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    });
  }, 500); // Small delay to ensure webcam component is ready
};
  
// Step 3: Stop recording
const stopRecording = () => {
  console.log("Stopping recording...");
  
  // Stop the timer
  if (recordingTimer) {
    clearInterval(recordingTimer);
    console.log("Recording timer cleared");
  }
  
  if (mediaRecorderRef.current) {
    // Check if it's actually recording
    if (mediaRecorderRef.current.state === 'recording') {
      console.log("MediaRecorder is active, stopping it...");
      
      // Request a final data chunk
      mediaRecorderRef.current.requestData();
      
      // Small delay to ensure the final data is captured
      setTimeout(() => {
        try {
          mediaRecorderRef.current.stop();
          console.log("MediaRecorder stopped successfully");
        } catch (err) {
          console.error("Error stopping MediaRecorder:", err);
        }
      }, 500);
    } else {
      console.log(`MediaRecorder not recording (state: ${mediaRecorderRef.current.state})`);
      setRecordingStatus('review');
    }
  } else {
    console.log("No MediaRecorder instance found");
    setRecordingStatus('review');
  }
};
  
  // Retry recording
  const retryRecording = () => {
    // Stop webcam tracks
    if (webcamRef.current && webcamRef.current.video.srcObject) {
      webcamRef.current.video.srcObject.getTracks().forEach(track => track.stop());
    }
    
    setRecordedChunks([]);
    setRecordingStatus('idle');
    setRecordingTime(0);
  };
  
  // Step 4: Submit recording and move to next question
  const submitRecording = async () => {
    if (recordedChunks.length === 0) {
      setError("No recording captured. Please try again.");
      return;
    }
    
    setRecordingStatus('processing');
    
    try {
      // Create blob from chunks
      const blob = new Blob(recordedChunks, {
        type: 'video/webm'
      });
      
      console.log(`Video recorded: ${(blob.size / (1024 * 1024)).toFixed(2)} MB`);
      
      // In a real app, upload the blob here
      // For demo, simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update progress
      const newProgress = ((currentQuestionIndex + 1) / questions.length) * 100;
      setVerificationProgress(newProgress);
      
      // Update questions array to mark this one as answered
      setQuestions(prev => prev.map((q, idx) => 
        idx === currentQuestionIndex ? { ...q, isAnswered: true } : q
      ));
      
      // Check if more questions
      if (currentQuestionIndex < questions.length - 1) {
        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
        setRecordingStatus('idle');
        
        // Stop webcam tracks
        if (webcamRef.current && webcamRef.current.video.srcObject) {
          webcamRef.current.video.srcObject.getTracks().forEach(track => track.stop());
        }
      } else {
        // Completed all questions
        setOverallStatus('completed');
      }
    } catch (err) {
      console.error("Error processing video:", err);
      setError("Failed to process your recording. Please try again.");
    }
  };
  
  // Navigate to next step
  const handleComplete = () => {
    navigate(`/loan/${loanId}`);
  };
  
  // Loading state
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
  
  // Error state
  if (error && recordingStatus !== 'idle' && recordingStatus !== 'review') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button variant="contained" onClick={() => navigate(`/loan/${loanId}`)}>
          Return to Loan Details
        </Button>
      </Container>
    );
  }
  
  // Completion state
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
  
  // Main UI
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* Modified webcam initialization - always present regardless of recording status */}
      <div style={{ display: 'none' }}>
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={{
            facingMode: "user"
          }}
        />
      </div>
      
      {/* Rest of your UI */}
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
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box>
          {/* Step 1: Question intro */}
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
          
          {/* Step 2: Playing question video */}
          {recordingStatus === 'playing-video' && (
            <Box sx={{ width: '100%', aspectRatio: '16/9', mb: 2 }}>
              <video
                ref={questionVideoRef}
                src={currentQuestion.videoUrl}
                style={{ width: '100%', height: '100%' }}
                controls
                preload="auto"
                autoPlay
                onEnded={handleQuestionVideoEnded}
                onError={(e) => handleVideoError(e.target)}
              />
            </Box>
          )}
          
          {/* Countdown before recording */}
          {recordingStatus === 'countdown' && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: 4
            }}>
              <Typography variant="h2" color="primary">
                {countdown}
              </Typography>
              <Typography variant="h6">
                Recording will start in...
              </Typography>
            </Box>
          )}
          
          {/* Step 3: Recording user response */}
              {recordingStatus === 'recording' && (
                <>
                  <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/9', mb: 2 }}>
                    {/* Don't render a new Webcam - show the existing one */}
                    <video
                      ref={element => {
                        if (element && webcamRef.current && webcamRef.current.video) {
                          element.srcObject = webcamRef.current.video.srcObject;
                          element.play();
                        }
                      }}
                      style={{ width: '100%', height: '100%' }}
                      muted
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
              
              {/* Step 4: Review recording */}
              {recordingStatus === 'review' && (
      <>
        <Typography variant="h6" gutterBottom>
          Review Your Response
        </Typography>

        {recordedChunks.length > 0 ? (
          <Box sx={{ width: '100%', aspectRatio: '16/9', mb: 2 }}>
            <video
              ref={videoRef}
              src={URL.createObjectURL(new Blob(recordedChunks, { type: 'video/webm' }))}
              style={{ width: '100%', height: '100%' }}
              controls
              autoPlay
              onError={(e) => {
                console.error("Error playing recorded video:", e);
                setError("Error playing back your recording. The format might not be supported.");
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              backgroundColor: '#f5f5f5',
              mb: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No recording captured. Please try again.
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="outlined" onClick={retryRecording}>
            Record Again
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={submitRecording}
            disabled={recordedChunks.length === 0}
          >
            Submit Response
          </Button>
        </Box>
      </>
    )}

          
          {/* Step 5: Processing */}
          {recordingStatus === 'processing' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
              <CircularProgress />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Processing your response...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We're analyzing your answer
              </Typography>
              {error && (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                  {error}
                  <Button 
                    size="small" 
                    sx={{ ml: 2 }} 
                    onClick={retryRecording}
                  >
                    Try Again
                  </Button>
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default VideoVerificationStep;