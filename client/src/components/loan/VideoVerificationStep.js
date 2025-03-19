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
  const streamRef = useRef(null);
  
  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [step, setStep] = useState('intro'); // intro, playing-video, recording, review, processing
  const [recordingTime, setRecordingTime] = useState(0);
  const [maxRecordingTime] = useState(30); // 30 seconds max
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  // Initialize with sample questions
  useEffect(() => {
    const mockQuestions = [
      {
        id: 'q1',
        text: 'Please state your full name and date of birth',
        videoUrl:'http://localhost:3000//videos/prompts/1.mp4'
      },
      {
        id: 'q2',
        text: 'What is your current home address?',
        videoUrl:'http://localhost:3000//videos/prompts/2.mp4'
      },
      {
        id: 'q3',
        text: 'Can you show your Aadhaar card to the camera?',
        videoUrl:'http://localhost:3000//videos/prompts/3.mp4'
      }
    ];
    
    setQuestions(mockQuestions);
    setLoading(false);
  }, [loanId]);
  
  // Current question helper
  const currentQuestion = questions[currentQuestionIndex] || {
    id: 'default',
    text: 'Default question',
    videoUrl: ''
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopMediaTracks();
    };
  }, []);
  
  // Stop all media tracks to release camera
  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };
  
  // Format time helper (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Step 1: Play question video
  const playQuestionVideo = () => {
    setStep('playing-video');
    
    console.log("Playing video:", currentQuestion.videoUrl);
    
    const video = document.createElement('video');
    video.src = currentQuestion.videoUrl;
    video.controls = true;
    video.style.width = '100%';
    video.style.height = '100%';
    
    // Add error handling
    video.onerror = (e) => {
      console.error("Video error:", e);
      console.error("Error code:", video.error ? video.error.code : "unknown");
      console.error("Error message:", video.error ? video.error.message : "unknown");
      setError(`Failed to load video: ${video.error ? video.error.message : "File not found or format not supported"}`);
      
      // Fallback to online videos if local videos fail
      console.log("Falling back to online videos");
      let fallbackUrl;
      switch(currentQuestionIndex) {
        case 0:
          fallbackUrl = 'https://assets.mixkit.co/videos/preview/mixkit-woman-talking-through-a-video-call-598-large.mp4';
          break;
        case 1:
          fallbackUrl = 'https://assets.mixkit.co/videos/preview/mixkit-man-talking-through-a-video-call-575-large.mp4';
          break;
        case 2:
          fallbackUrl = 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-a-video-call-with-smartphone-42982-large.mp4';
          break;
        default:
          fallbackUrl = 'https://assets.mixkit.co/videos/preview/mixkit-woman-having-a-video-call-600-large.mp4';
      }
      video.src = fallbackUrl;
      console.log("Using fallback video:", fallbackUrl);
    };
    
    const container = document.getElementById('video-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(video);
      
      // Auto play with fallback
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error auto-playing video:', error);
          video.controls = true; // Show controls if autoplay fails
        });
      }
      
      // When video ends, start recording
      video.onended = () => {
        startRecording();
      };
    }
  };
  
  // Step 2: Start recording after video ends
  const startRecording = () => {
    setStep('recording');
    setRecordingTime(0);
    setRecordedChunks([]);
    setError('');
    
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: 1280,
        height: 720,
        facingMode: "user"
      }
    })
    .then(stream => {
      streamRef.current = stream;
      
      if (webcamRef.current) {
        webcamRef.current.video.srcObject = stream;
      }
      
      // Create MediaRecorder
      let options;
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        options = {mimeType: 'video/webm;codecs=vp9,opus'};
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        options = {mimeType: 'video/webm'};
      } else {
        options = {};
      }
      
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log("Data available:", event.data.size, "bytes");
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.onstop = () => {
        console.log("MediaRecorder stopped");
        setStep('review');
      };
      
      recorder.start(1000); // Capture in 1 second chunks
      
      // Set up timer
      const timer = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxRecordingTime) {
            clearInterval(timer);
            stopRecording();
            return maxRecordingTime;
          }
          return prev + 1;
        });
      }, 1000);
      
      // Auto stop after max time
      setTimeout(() => {
        if (recorder.state === 'recording') {
          stopRecording();
        }
      }, maxRecordingTime * 1000);
      
    })
    .catch(err => {
      console.error("Error accessing media devices:", err);
      setError(`Camera access error: ${err.message || 'Unknown error'}`);
      setStep('intro');
    });
  };
  
  // Step 3: Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log("Stopping recording...");
      
      // Request final data chunk before stopping
      mediaRecorderRef.current.requestData();
      
      setTimeout(() => {
        mediaRecorderRef.current.stop();
      }, 200);
    } else {
      console.log("No active recording to stop");
      setStep('review');
    }
  };
  
  // Step 4: Submit recording and move to next question
  const submitRecording = () => {
    setStep('processing');
    
    // Create blob from chunks
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, {
        type: 'video/webm'
      });
      
      console.log(`Video recorded: ${(blob.size / (1024 * 1024)).toFixed(2)} MB`);
      
      // In a real app, upload the blob here
      // For demo, we'll simulate processing
      setTimeout(() => {
        // Update progress
        const newProgress = ((currentQuestionIndex + 1) / questions.length) * 100;
        setProgress(newProgress);
        
        // Check if more questions
        if (currentQuestionIndex < questions.length - 1) {
          // Move to next question
          setCurrentQuestionIndex(prev => prev + 1);
          setStep('intro');
        } else {
          // Completed all questions
          setCompleted(true);
        }
        
        // Release camera
        stopMediaTracks();
        
      }, 2000);
    } else {
      setError("No recording data available. Please try again.");
      setStep('intro');
    }
  };
  
  // Skip current question for demo
  const skipQuestion = () => {
    setStep('processing');
    
    setTimeout(() => {
      // Update progress
      const newProgress = ((currentQuestionIndex + 1) / questions.length) * 100;
      setProgress(newProgress);
      
      // Check if more questions
      if (currentQuestionIndex < questions.length - 1) {
        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
        setStep('intro');
      } else {
        // Completed all questions
        setCompleted(true);
      }
      
      // Release camera
      stopMediaTracks();
    }, 1000);
  };
  
  // Retry recording
  const retryRecording = () => {
    setStep('intro');
    setRecordedChunks([]);
    stopMediaTracks();
  };
  
  // Render loading state
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
  
  // Render completion state
  if (completed) {
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
          onClick={() => onComplete && onComplete(true)}
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
            value={progress} 
            sx={{ height: 8, borderRadius: 5 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Typography>
            <Typography variant="body2">
              {Math.round(progress)}% Complete
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          {/* STEP 1: Question intro */}
          {step === 'intro' && (
            <>
              <Typography variant="h6" gutterBottom>
                Question: {currentQuestion.text}
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
          
          {/* STEP 2: Playing AI video */}
          {step === 'playing-video' && (
            <>
              <Box id="video-container" sx={{ width: '100%', aspectRatio: '16/9', mb: 2 }}>
                {/* Video element gets inserted here by JS */}
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={startRecording}
              >
                Skip Video & Start Recording
              </Button>
            </>
          )}
          
          {/* STEP 3: Recording user response */}
          {step === 'recording' && (
            <>
              <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/9', mb: 2 }}>
                <Webcam
                  audio={true}
                  ref={webcamRef}
                  style={{ 
                    width: '100%', 
                    height: '100%'
                  }}
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: "user"
                  }}
                  mirrored={true}
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
          
          {/* STEP 4: Review recording */}
          {step === 'review' && (
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
                    No recording captured. Please try again.
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
          
          {/* STEP 5: Processing */}
          {step === 'processing' && (
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
              <Button color="error" size="small" onClick={skipQuestion}>
                Skip Question
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