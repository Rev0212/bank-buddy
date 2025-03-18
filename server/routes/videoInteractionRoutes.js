const express = require('express');
const path = require('path');
const fs = require('fs');
const {
  createVideoInteractionSession,
  uploadVideoResponse,
  getVideoInteractionSession,
  getNextQuestion,
  completeVideoInteractionSession
} = require('../controllers/videoInteractionController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .post(createVideoInteractionSession);

router.route('/:sessionId')
  .get(getVideoInteractionSession);

router.post('/:sessionId/question/:questionId', uploadVideoResponse);

router.get('/:sessionId/next-question', getNextQuestion);

router.put('/:sessionId/complete', completeVideoInteractionSession);

// Stream a video prompt
router.get('/prompt/:videoName', (req, res) => {
  const videoPath = path.join(__dirname, '../public/videos/prompts', req.params.videoName);
  
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send('Video not found');
  }
  
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
    const chunksize = (end-start)+1;
    const file = fs.createReadStream(videoPath, {start, end});
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

module.exports = router;