import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import RecordRTC from 'recordrtc';
import axios from 'axios';

const VideoQuestion = ({ sessionId, question, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const videoRef = useRef(null);
  const webcamRef = useRef(null);
  const recorderRef = useRef(null);
  
  // Play the question video
  const playQuestion = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };
  
  // Start recording after question video ends
  const startRecordingWithCountdown = () => {
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
  
  // Actual recording start
  const startRecording = () => {
    setIsRecording(true);
    const stream = webcamRef.current.stream;
    recorderRef.current = new RecordRTC(stream, {
      type: 'video',
      mimeType: 'video/webm',
      bitsPerSecond: 128000
    });
    
    recorderRef.current.startRecording();
  };
  
  // Stop recording
  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current.getBlob();
        setRecordedBlob(blob);
        setIsRecording(false);
      });
    }
  };
  
  // Submit the recorded video
  const submitVideo = async () => {
    if (!recordedBlob) return;
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('video', recordedBlob, 'response.webm');
    
    try {
      await axios.post(
        `/api/video-interaction/${sessionId}/question/${question.questionId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setIsSubmitting(false);
      onComplete(question.questionId);
    } catch (error) {
      console.error('Error submitting video', error);
      setIsSubmitting(false);
    }
  };
  
  // Video ended event handler
  const handleVideoEnded = () => {
    setIsPlaying(false);
    startRecordingWithCountdown();
  };
  
  return (
    <div className="video-question-container">
      {!isPlaying && !isRecording && !recordedBlob && (
        <div className="question-intro">
          <h3>{question.questionText}</h3>
          <button onClick={playQuestion}>
            Watch Question Video
          </button>
        </div>
      )}
      
      {isPlaying && (
        <video 
          ref={videoRef}
          src={question.videoPromptUrl}
          controls={false}
          onEnded={handleVideoEnded}
          className="question-video"
        />
      )}
      
      {countdown > 0 && !isPlaying && !recordedBlob && (
        <div className="countdown">
          <h2>Recording starts in: {countdown}</h2>
        </div>
      )}
      
      {isRecording && (
        <div className="recording-container">
          <Webcam 
            ref={webcamRef}
            audio={true}
            muted={true}
            className="webcam-live"
          />
          <div className="recording-indicator">
            <span className="recording-dot"></span> Recording...
          </div>
          <button onClick={stopRecording}>
            Stop Recording
          </button>
        </div>
      )}
      
      {recordedBlob && !isSubmitting && (
        <div className="review-container">
          <h3>Review Your Answer</h3>
          <video 
            src={URL.createObjectURL(recordedBlob)} 
            controls 
            className="review-video"
          />
          <div className="action-buttons">
            <button onClick={() => setRecordedBlob(null)}>
              Record Again
            </button>
            <button onClick={submitVideo}>
              Submit Answer
            </button>
          </div>
        </div>
      )}
      
      {isSubmitting && (
        <div className="loading">
          <p>Submitting your response...</p>
          {/* Add spinner here */}
        </div>
      )}
    </div>
  );
};

export default VideoQuestion;