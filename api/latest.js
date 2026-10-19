// Vercel serverless function: returns the newest videos from the YouTube channel RSS feed.
// Cached at Vercel's edge for an hour so YouTube is hit at most once an hour.
const FEED = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCdS8jJ4EHFMjJmnh-S2mOag';

function decode(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

module.exports = async (req, res) => {
  try {
    const r = await fetch(FEED, { headers: { 'User-Agent': 'jevonperra.com' } });
    if (!r.ok) throw new Error('feed ' + r.status);
    const xml = await r.text();
    const videos = [];
    const re = /<entry>[\s\S]*?<yt:videoId>([^<]+)<\/yt:videoId>[\s\S]*?<title>([^<]*)<\/title>[\s\S]*?<published>([^<]+)<\/published>/g;
    let m;
    while ((m = re.exec(xml)) && videos.length < 12) {
      videos.push({ id: m[1], title: decode(m[2]), published: m[3].slice(0, 10) });
    }
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ videos });
  } catch (e) {
    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(502).json({ videos: [], error: 'feed unavailable' });
  }
};
