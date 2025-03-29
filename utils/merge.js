const fs = require('fs');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

async function downloadFile(url, filename) {
  const writer = fs.createWriteStream(filename);
  const response = await axios({ url, method: 'GET', responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filename));
    writer.on('error', reject);
  });
}

async function mergeVideosWithAudio(url1, url2, audioUrl) {
  const id = uuidv4();
  const video1 = `tmp/${id}_v1.mp4`;
  const video2 = `tmp/${id}_v2.mp4`;
  const audio = `tmp/${id}_a.mp3`;
  const concatList = `tmp/${id}_list.txt`;
  const output = `tmp/${id}_final.mp4`;

  fs.mkdirSync('tmp', { recursive: true });

  await downloadFile(url1, video1);
  await downloadFile(url2, video2);
  await downloadFile(audioUrl, audio);

  fs.writeFileSync(concatList, `file '${video1}'\nfile '${video2}'`);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatList)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .input(audio)
      .outputOptions('-c:v copy', '-c:a aac', '-shortest')
      .save(output)
      .on('end', () => resolve(output))
      .on('error', (err) => {
  console.error('FFmpeg error:', err.message);
  reject(err);
});
  });
}

module.exports = { mergeVideosWithAudio };
