const ytdl = require('@distube/ytdl-core');
const path = require('path');
const os = require('os');

export default async function handler(req, res) {
  // CORS Headers add kiye gaye hain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, format } = req.query;

  // URL verification
  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Sahi YouTube URL nahi hai' });
  }

  try {
    // Vercel ke liye "read-only" error (EROFS) ka RAM-based temporary fix
    const tmpCacheDir = path.join(os.tmpdir(), 'ytdl-cache');

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '_');

    if (format === 'mp4') {
      res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
      res.setHeader('Content-Type', 'video/mp4');
      ytdl(url, { 
        format: 'mp4',
        cache: tmpCacheDir 
      }).pipe(res);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
      res.setHeader('Content-Type', 'audio/mpeg');
      ytdl(url, { 
        filter: 'audioonly',
        cache: tmpCacheDir 
      }).pipe(res);
    }
  } catch (error) {
    console.error("Vercel Streaming Error:", error);
    res.status(500).json({ error: 'Backend Error: ' + error.message });
  }
}
