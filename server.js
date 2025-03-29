const express = require('express');
const { mergeVideosWithAudio } = require('./utils/merge');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/join-video', async (req, res) => {
  const { video1_url, video2_url, audio_url } = req.body;

  if (!video1_url || !video2_url || !audio_url) {
    return res.status(400).json({ error: 'Missing one or more required URLs' });
  }

  try {
    const videoPath = await mergeVideosWithAudio(video1_url, video2_url, audio_url);
    return res.download(videoPath); // отдаём файл напрямую
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong during merging.' });
  }
});

app.listen(PORT, () => {
  console.log(`FFmpeg Joiner listening on port ${PORT}`);
});
