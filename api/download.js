const ytdl = require('ytdl-core');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, format } = req.query;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '_');

    if (format === 'mp4') {
      res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
      res.setHeader('Content-Type', 'video/mp4');
      ytdl(url, { format: 'mp4' }).pipe(res);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
      res.setHeader('Content-Type', 'audio/mpeg');
      ytdl(url, { filter: 'audioonly' }).pipe(res);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Download failed.' });
  }
}
