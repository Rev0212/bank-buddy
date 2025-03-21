import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Box, Typography, Paper, Button, 
  CircularProgress, LinearProgress, Alert
} from '@mui/material';
import {
  Videocam, CheckCircle, ArrowForward,
  MicOff, Mic
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

const VideoVerificationStep = () => {
  const { id: loanId } = useParams();
  const navigate = useNavigate();
  
  // ======== Refs ========
  const mediaRecorderRef = useRef(null);
  const liveVideoRef = useRef(null);
  const reviewVideoRef = useRef(null);
  const questionVideoRef = useRef(null);
  const streamRef = useRef(null);
  
  // ======== States ========
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingStatus, setRecordingStatus] = useState('idle'); // idle, playing-video, countdown, recording, review, processing
  const [countdown, setCountdown] = useState(3);
  const [recordingTime, setRecordingTime] = useState(0);
  const [maxRecordingTime] = useState(30); // 30 seconds max
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [overallStatus, setOverallStatus] = useState('pending'); // pending, in-progress, completed
  const [recordingBlob, setRecordingBlob] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  
  // Get current question - add a safe check to prevent undefined access
  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] || {} : {};
  
  // ======== Utility Functions ========
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  // Enhanced clean up function that resets all recording state
  const cleanupMediaResources = () => {
    console.log("Cleaning up media resources");
    
    // Stop recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
        console.log("Stopped active media recorder");
      } catch (err) {
        console.error('Error stopping recorder:', err);
      }
      mediaRecorderRef.current = null;
    }
    
    // Clear timer if running
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
    
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    // Clear video elements
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
    
    // No need to manage video preview URLs anymore
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
  };
  
  // ======== Fetch Questions ========
  useEffect(() => {
    console.log("Initializing questions...");
    
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
        questionText: 'Please show your ID card to the camera',
        videoUrl: `${process.env.REACT_APP_BASE_URL || ''}/videos/3.mp4`,
        isAnswered: false
      }
    ];
    
    // Set everything in order to ensure proper initialization
    setQuestions(mockQuestions);
    setCurrentQuestionIndex(0);
    setRecordingStatus('idle');
    setVerificationProgress(0);
    setOverallStatus('in-progress');
    setLoading(false);
    
    console.log("Questions initialized");
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupMediaResources();
    };
  }, []);
  
  // Add debugging to track question transitions - add check to prevent unnecessary logs
  useEffect(() => {
    if (questions.length > 0 && currentQuestion) {
      console.log(`Current question index: ${currentQuestionIndex}, Question: ${currentQuestion.questionText}`);
    }
  }, [currentQuestionIndex, currentQuestion, questions]);
  
  // ======== Video Question Functions ========
  // Modified function to play the question video with proper source tracking - add safety check
  const playQuestionVideo = () => {
    setRecordingStatus('playing-video');
    console.log("Setting up to play video:", currentQuestion.videoUrl);
    
    // Reset any previous video element state
    if (questionVideoRef.current) {
      questionVideoRef.current.src = currentQuestion.videoUrl;
    }
  };
  
  const handleVideoError = (videoElement) => {
    console.log("Video error, using fallback");
    // Force a fallback to a known working video
    videoElement.src = "https://assets.mixkit.co/videos/preview/mixkit-woman-talking-through-a-video-call-598-large.mp4";
    videoElement.play().catch(e => {
      console.error("Fallback video also failed:", e);
      // Auto-advance if even fallback fails
      handleQuestionVideoEnded();
    });
  };
  
  const handleQuestionVideoEnded = () => {
    setRecordingStatus('countdown');
    startRecordingCountdown();
  };
  
  // ======== Recording Functions ========
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
  
  const startRecording = async () => {
    setRecordingStatus('recording');
    setRecordingTime(0);
    setRecordedChunks([]);
    setRecordingBlob(null); // Ensure we clear any previous blob
    setError('');
    
    try {
      // Get user media with optimized video settings to prevent slow motion recording
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 640, max: 854 },  // Lower resolution for better performance
          height: { ideal: 480, max: 480 }, // Standard definition is more reliable
          frameRate: { ideal: 30, max: 30 }, // Explicitly set frame rate
          facingMode: "user"
        }
      });
      
      // Store the stream and set it to the video element
      streamRef.current = stream;
      
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.muted = true; // Mute to avoid feedback
        liveVideoRef.current.play().catch(e => console.error("Error playing local video:", e));
      }
      
      // Find the best supported MIME type
      let mimeType = '';
      const supportedTypes = [
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4',
        ''  // Empty string as fallback
      ];
      
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          console.log(`Using MIME type: ${mimeType}`);
          break;
        }
      }
      
      // Create media recorder with performance-optimized settings
      const options = {
        mimeType: mimeType,
        videoBitsPerSecond: 600000,  // Moderate bitrate (600kbps)
        audioBitsPerSecond: 96000,   // Lower audio bitrate (96kbps)
        audioBitrateMode: 'constant',
        videoFrameRate: 30  // Ensure consistent frame rate
      };
      
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      
      // Add speed check and logging for debugging
      console.log("Media recorder created with options:", options);
      console.log("Video tracks:", stream.getVideoTracks().map(track => ({
        settings: track.getSettings(),
        constraints: track.getConstraints()
      })));
      
      // Set up recorder events
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.onstop = () => {
        const chunks = recordedChunks;
        if (chunks.length > 0) {
          try {
            // Create a blob with proper MIME type based on collected chunks
            const mimeType = recorder.mimeType || 'video/webm';
            const blob = new Blob(chunks, { type: mimeType });
            
            console.log(`Recording completed: ${(blob.size / 1024).toFixed(2)} KB, type: ${blob.type}`);
            
            // Store the blob
            setRecordingBlob(blob);
            
            // Skip preview creation
            // createVideoPreview(blob);
            
            // Update state to show review screen
            setRecordingStatus('review');
          } catch (err) {
            console.error("Error processing recording:", err);
            setError("Error processing recording, but you can still try to submit.");
            setRecordingStatus('review');
          }
        } else {
          setError("No recording data captured. Please try again.");
          setRecordingStatus('idle');
        }
      };
      
      // Start the recorder with smaller chunks for more efficient processing
      recorder.start(500); // 500ms chunks instead of 1000ms
      
      // Set up timer for recording duration
      const timer = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxRecordingTime) {
            stopRecording();
            clearInterval(timer);
            return maxRecordingTime;
          }
          return newTime;
        });
      }, 1000);
      
      setRecordingTimer(timer);
      
    } catch (err) {
      console.error("Error starting recording:", err);
      setError(`Failed to access camera: ${err.message || 'Unknown error'}`);
      setRecordingStatus('idle');
    }
  };
  
  const stopRecording = () => {
    // Clear the recording timer
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
    
    // Stop the media recorder if it's recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      // If recorder isn't running for some reason, still move to review
      setRecordingStatus('review');
    }
  };

  const retryRecording = () => {
    cleanupMediaResources();
    setRecordedChunks([]);
    setRecordingBlob(null);
    setRecordingStatus('idle');
    setRecordingTime(0);
    setError('');
  };
  
  // Modify the submitRecording function to ensure proper state reset between questions
  const submitRecording = async () => {
    if (!recordingBlob) {
      setError("No recording available. Please try again.");
      return;
    }
    
    setRecordingStatus('processing');
    
    try {
      // Simulate API call to upload video
      console.log(`Video size: ${(recordingBlob.size / (1024 * 1024)).toFixed(2)} MB`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mark current question as answered
      setQuestions(prev => prev.map((q, idx) => 
        idx === currentQuestionIndex ? { ...q, isAnswered: true } : q
      ));
      
      // Update progress
      const newProgress = ((currentQuestionIndex + 1) / questions.length) * 100;
      setVerificationProgress(newProgress);
      
      // Clean up media resources before moving to next question
      cleanupMediaResources();
      
      // Reset recording state
      setRecordedChunks([]);
      setRecordingBlob(null);
      
      if (currentQuestionIndex < questions.length - 1) {
        // Store the next index to prevent race conditions
        const nextIndex = currentQuestionIndex + 1;
        
        // Set the next question index first
        setCurrentQuestionIndex(nextIndex);
        
        // Then update the recording status
        setTimeout(() => {
          setRecordingStatus('idle');
        }, 100);
      } else {
        // All questions completed
        setOverallStatus('completed');
      }
    } catch (err) {
      console.error("Error submitting recording:", err);
      setError("Failed to process your recording. Please try again.");
      setRecordingStatus('review');
    }
  };
  
  // Handle completion
  const handleComplete = () => {
    navigate(`/loan/${loanId}`);
  };
  
  // ======== Rendering ========
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
      {/* Header with progress */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Video Verification
        </Typography>
        <Typography variant="body1" paragraph>
          Please answer the following questions. Your responses will be recorded for verification.
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
      
      {/* Main content area */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box>
          {/* Question intro */}
          {recordingStatus === 'idle' && currentQuestion?.questionText && (
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
                disabled={!currentQuestion?.videoUrl}
              >
                Play Question Video
              </Button>
            </>
          )}
          
          {/* Playing question video */}
          {recordingStatus === 'playing-video' && (
            <Box sx={{ width: '100%', aspectRatio: '16/9', mb: 2 }}>
              <video
                ref={questionVideoRef}
                src={currentQuestion.videoUrl}
                style={{ width: '100%', height: '100%' }}
                controls
                preload="auto"
                autoPlay
                onCanPlay={(e) => {
                  console.log("Video can play now, attempting playback");
                  if (recordingStatus === 'playing-video') {
                    e.target.play().catch(err => {
                      console.error('Error playing video:', err);
                      handleVideoError(e.target);
                    });
                  }
                }}
                onEnded={handleQuestionVideoEnded}
                onError={(e) => {
                  console.error("Video error occurred:", e.target.error);
                  handleVideoError(e.target);
                }}
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
          
          {/* Recording user response */}
          {recordingStatus === 'recording' && (
            <>
              <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/9', mb: 2 }}>
                <video
                  ref={liveVideoRef}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  muted
                  autoPlay
                  playsInline
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
          
          {/* Review recording */}
          {recordingStatus === 'review' && (
            <>
              <Typography variant="h6" gutterBottom>
                Your Response
              </Typography>

              {recordingBlob ? (
                <Box sx={{ 
                  width: '100%', 
                  backgroundColor: '#f0f0f0', 
                  borderRadius: 2,
                  p: 3, 
                  mb: 2, 
                  textAlign: 'center',
                  border: '1px solid #e0e0e0'
                }}>
                  <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Recording Completed
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Your response has been recorded successfully.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Recording size: {recordingBlob ? `${(recordingBlob.size / 1024).toFixed(2)} KB` : 'Unknown'}
                  </Typography>
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
                <Alert severity="warning" sx={{ mb: 2 }}>
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
                  disabled={!recordingBlob}
                >
                  Submit Response
                </Button>
              </Box>
            </>
          )}
          
          {/* Processing */}
          {recordingStatus === 'processing' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
              <CircularProgress />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Processing your response...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We're analyzing your answer
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default VideoVerificationStep;