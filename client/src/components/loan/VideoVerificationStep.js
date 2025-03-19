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
  
  // Define a safe currentQuestion getter
  const currentQuestion = questions[currentQuestionIndex] || {
    questionId: 'default',
    questionText: 'Default question',
    videoPromptUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-talking-through-a-video-call-598-large.mp4'
  };

  // Load session data
  useEffect(() => {
    const initializeVerification = async () => {
      try {
        setLoading(true);
        
        // Mock data for demo using local video files from server
        const mockSession = {
          _id: 'demo-session-' + Date.now(),
          status: 'in-progress',
          questions: [
            {
              questionId: 'q1',
              questionText: 'Please state your full name and date of birth',
              videoPromptUrl: '/api/video-interaction/prompt/1.mp4', // Use the API route
              isAnswered: false
            },
            {
              questionId: 'q2',
              questionText: 'What is your current home address?',
              videoPromptUrl: '/api/video-interaction/prompt/2.mp4', // Use the API route
              isAnswered: false
            },
            {
              questionId: 'q3',
              questionText: 'Can you show your Aadhaar card to the camera?',
              videoPromptUrl: '/api/video-interaction/prompt/3.mp4', // Use the API route
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

  // Debug effect to log state
  useEffect(() => {
    console.log('Current state:', {
      questions,
      currentQuestionIndex,
      currentQuestion: questions[currentQuestionIndex],
      loading,
      error,
      isPlayingQuestion
    });
  }, [questions, currentQuestionIndex, loading, error, isPlayingQuestion]);
  
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
  
  // Update the playQuestionVideo function to use external URLs for each question:

const playQuestionVideo = () => {
  // Use the video container reference rather than creating elements
  const container = document.getElementById('video-container');
  if (!container) {
    console.error('Video container not found');
    handleQuestionVideoEnded();
    return;
  }
  
  // Try to use the URL from the question data first, then fall back to demo URLs
  let videoUrl = currentQuestion.videoPromptUrl;
  
  // If the URL is an API path or doesn't exist, use fallback videos
  if (!videoUrl || videoUrl.startsWith('/api/')) {
    // Fallback videos for demo purposes
    switch(currentQuestionIndex) {
      case 0:
        videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-woman-talking-through-a-video-call-598-large.mp4';
        break;
      case 1:
        videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-man-talking-through-a-video-call-575-large.mp4';
        break;
      case 2:
        videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-a-video-call-with-smartphone-42982-large.mp4';
        break;
      default:
        videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-woman-having-a-video-call-600-large.mp4';
    }
  }
  
  console.log('Playing video for question', currentQuestionIndex + 1, ':', videoUrl);
  
  // Create video element if it doesn't exist
  if (!aiVideoRef.current) {
    const videoElement = document.createElement('video');
    videoElement.controls = true;
    videoElement.style.position = 'absolute';
    videoElement.style.top = '0';
    videoElement.style.left = '0';
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    videoElement.onended = handleQuestionVideoEnded;
    videoElement.onerror = () => {
      console.error('Video error occurred');
      handleQuestionVideoEnded();
    };
    
    container.innerHTML = '';
    container.appendChild(videoElement);
    aiVideoRef.current = videoElement;
  }
  
  // Set video source and try playing
  if (aiVideoRef.current) {
    aiVideoRef.current.src = videoUrl;
    aiVideoRef.current.load(); // Important for some browsers
    
    // Set playing state before attempting to play
    setIsPlayingQuestion(true);
    
    // Try to play with a short delay to ensure DOM updates
    setTimeout(() => {
      console.log('Attempting to play video...');
      const playPromise = aiVideoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing video:', error);
          // Show controls to allow manual play (common for autoplay restrictions)
          aiVideoRef.current.controls = true;
        });
      }
    }, 500);
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
  
  // Update the startRecording function:

const startRecording = () => {
  // First explicitly request permissions
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      // Successfully got permissions and stream
      startRecordingWithStream(stream);
    })
    .catch(err => {
      console.error("Camera/mic permission error:", err);
      setError(
        "Cannot access camera or microphone. For the demo, click 'Skip Recording' below."
      );
      setRecordingStatus('idle');
    });
};

// Replace the startRecordingWithStream function with this simpler version
const startRecordingWithStream = (stream) => {
  setRecordingStatus('recording');
  setIsRecording(true);
  setRecordedChunks([]);
  setRecordingTime(0);
  
  console.log("Creating media recorder with stream", stream);
  console.log("Stream tracks:", {
    audio: stream.getAudioTracks().map(t => ({ enabled: t.enabled, muted: t.muted, id: t.id })),
    video: stream.getVideoTracks().map(t => ({ enabled: t.enabled, muted: t.muted, id: t.id }))
  });
  
  try {
    // Simple configuration - use most compatible options
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
    console.log('MediaRecorder created, state:', mediaRecorderRef.current.state);
    
    // Create direct event listeners with explicit functions
    mediaRecorderRef.current.ondataavailable = (event) => {
      console.log('Data available event fired, size:', event.data.size);
      if (event.data && event.data.size > 0) {
        // Update using functional form to ensure latest state
        setRecordedChunks((prev) => {
          console.log("Previous chunks:", prev.length, "Adding new chunk");
          return [...prev, event.data];
        });
      }
    };
    
    mediaRecorderRef.current.onstop = () => {
      console.log('MediaRecorder stopped');
      handleRecordingStopped();
    };
    
    mediaRecorderRef.current.onerror = (error) => {
      console.error('MediaRecorder error:', error);
      setError("Recording error occurred: " + error.message || "Unknown error");
    };
    
    // Start recording with smaller time slices for more frequent chunks
    mediaRecorderRef.current.start(1000);
    console.log('MediaRecorder started, state:', mediaRecorderRef.current.state);
    
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
  } catch (err) {
    console.error("Error creating media recorder:", err);
    setError("Could not start recording: " + err.message);
  }
};
  
  // Handle recorded video data
  const handleDataAvailable = (event) => {
    if (event.data && event.data.size > 0) {
      console.log(`Adding chunk of size ${event.data.size} bytes`);
      setRecordedChunks(prev => [...prev, event.data]);
    } else {
      console.warn('Received dataavailable event with no data or zero size');
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
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'recording') {
        console.log("Stopping MediaRecorder...");
        
        try {
          // Always request data before stopping to ensure we capture the final segment
          mediaRecorderRef.current.requestData();
          
          // Small delay before stopping to ensure requestData completes
          setTimeout(() => {
            mediaRecorderRef.current.stop();
            console.log("MediaRecorder stop command issued");
          }, 200);
        } catch (err) {
          console.error("Error stopping MediaRecorder:", err);
          // Force the completed state if there's an error
          handleRecordingStopped();
        }
      } else {
        console.log(`MediaRecorder is not recording (state: ${mediaRecorderRef.current.state})`);
        handleRecordingStopped();
      }
    } else {
      console.log("No MediaRecorder to stop");
      handleRecordingStopped();
    }
    
    // Clear the recording timer regardless
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
  };
  
  // Add these functions before the return statements (around line 270-280):

// Format time for display (MM:SS)
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Handle retry recording
const retryRecording = () => {
  setRecordingStatus('idle');
  setRecordedChunks([]);
};

// Move to next question with skip
const skipToNextQuestion = () => {
  setRecordingStatus('processing');
  
  // Simulate processing delay for demo
  setTimeout(() => {
    // Mark current question as answered
    setQuestions(prev => prev.map((q, idx) => 
      idx === currentQuestionIndex ? { ...q, isAnswered: true } : q
    ));
    
    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setRecordingStatus('idle');
      setVerificationProgress(((currentQuestionIndex + 1) / questions.length) * 100);
    } else {
      // Complete verification
      setOverallStatus('completed');
      setVerificationProgress(100);
    }
  }, 1500);
};

// Handle submission of recording
const submitRecording = () => {
  if (!recordedChunks.length) {
    setError("Please record a response or use the 'Record Again' button.");
    return;
  }
  
  setRecordingStatus('processing');
  
  // Create a form data object to send the video
  const formData = new FormData();
  const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
  
  // In a real implementation, you would send this to your API
  // formData.append('video', videoBlob, 'response.webm');
  // formData.append('questionId', currentQuestion.questionId);
  // formData.append('sessionId', sessionId);
  
  console.log("Video size:", (videoBlob.size / 1024).toFixed(2) + " KB");
  
  // For demo: simulate API call with timeout
  setTimeout(() => {
    // Update verification results
    setVerificationResults(prev => ({
      ...prev,
      [currentQuestion.questionId]: {
        text: "Sample transcription for " + currentQuestion.questionText,
        verified: true,
        confidence: Math.random() * 0.3 + 0.7, // Random between 0.7-1.0
        matchedDocument: currentQuestion.questionId === 'q3' ? "aadhaar_card" : null
      }
    }));
    
    // Mark question as answered
    setQuestions(prev => prev.map((q, idx) => 
      idx === currentQuestionIndex ? { ...q, isAnswered: true } : q
    ));
    
    // Update progress
    const newProgress = ((currentQuestionIndex + 1) / questions.length) * 100;
    setVerificationProgress(newProgress);
    
    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setRecordingStatus('idle');
    } else {
      // All questions answered, complete verification
      setOverallStatus('completed');
    }
  }, 2000);
};

// Ensure we get webcam permissions as soon as we start the recording process
useEffect(() => {
  if (recordingStatus === 'recording' && webcamRef.current && webcamRef.current.stream) {
    // If the webcam is active but we don't have a media recorder yet
    if (!mediaRecorderRef.current) {
      startRecordingWithStream(webcamRef.current.stream);
    }
  }
}, [recordingStatus]);

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
            <Box id="video-container" sx={{ position: 'relative', width: '100%', pt: '56.25%' }}>
              <video
                ref={aiVideoRef}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                controls
                onEnded={handleQuestionVideoEnded}
                onError={(e) => {
                  console.error('Video error event:', e);
                  handleQuestionVideoEnded();
                }}
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
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: "user"
                  }}
                  mirrored={true}
                  screenshotFormat="image/jpeg"
                  onUserMedia={(stream) => {
                    console.log("Webcam stream available", {
                      audioTracks: stream.getAudioTracks().length,
                      videoTracks: stream.getVideoTracks().length, 
                      active: stream.active
                    });
                    
                    // Enable both audio and video tracks explicitly
                    stream.getAudioTracks().forEach(track => track.enabled = true);
                    stream.getVideoTracks().forEach(track => track.enabled = true);
                    
                    // Check if media recorder is active, if not and we're recording, start it
                    if (isRecording && (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording')) {
                      console.log("Starting MediaRecorder from webcam callback");
                      startRecordingWithStream(stream);
                    }
                  }}
                  onUserMediaError={(err) => {
                    console.error('Webcam error:', err);
                    setError('Failed to access webcam: ' + (err.message || err.name || "Unknown error"));
                  }}
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
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<MicOff />}
                  onClick={stopRecording}
                  sx={{ flexGrow: 1, mr: 1 }}
                >
                  Stop Recording
                </Button>
                    
                <Button
                  variant="outlined"
                  onClick={() => {
                    // Instead of creating a dummy blob, just stop the recording
                    // This will use whatever has been recorded so far, even if it's just a few frames
                    stopRecording();
                  }}
                  sx={{ flexGrow: 0 }}
                >
                  Finish Early
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => {
                    // Manual data request for testing
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                      console.log("Manually requesting data");
                      mediaRecorderRef.current.requestData();
                    } else {
                      console.log("MediaRecorder not available or not recording");
                    }
                  }}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  Debug
                </Button>
              </Box>
            </>
          )}
          
          {recordingStatus === 'completed' && (
            <>
              <Typography variant="h6" gutterBottom>
                Review Your Response
              </Typography>
              
              {recordedChunks.length > 0 ? (
                <Box sx={{ position: 'relative', width: '100%', pt: '56.25%', mb: 2 }}>
                  <video
                    ref={videoRef}
                    src={URL.createObjectURL(new Blob(recordedChunks, { type: 'video/webm' }))}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    controls
                    onError={(e) => {
                      console.error("Error playing recorded video:", e);
                      setError("There was an issue with your recording. You can try again or continue anyway.");
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '200px',
                  backgroundColor: '#f5f5f5', 
                  mb: 2 
                }}>
                  <Typography variant="body1" color="text.secondary">
                    No recording captured. Please try again or continue.
                  </Typography>
                </Box>
              )}
                          
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
                  disabled={recordedChunks.length === 0}
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
          <Alert 
            severity="error" 
            sx={{ mt: 2 }}
            action={
              <Button color="error" size="small" onClick={skipToNextQuestion}>
                Skip Recording
              </Button>
            }
          >
            {error}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default VideoVerificationStep;