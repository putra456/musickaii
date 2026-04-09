const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../app/dist')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kaiimusic', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Schemas
const songSchema = new mongoose.Schema({
  youtubeId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  artist: { type: String, required: true },
  thumbnail: { type: String, required: true },
  duration: { type: Number, default: 0 },
  genre: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  playlists: [{
    name: { type: String, required: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
    createdAt: { type: Date, default: Date.now }
  }],
  listeningHistory: [{
    song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
    playedAt: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 }
  }],
  listeningPattern: {
    genres: { type: Map, of: Number, default: {} },
    artists: { type: Map, of: Number, default: {} },
    moods: { type: Map, of: Number, default: {} }
  },
  createdAt: { type: Date, default: Date.now }
});

const Song = mongoose.model('Song', songSchema);
const User = mongoose.model('User', userSchema);

// YouTube API - Search
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      // Fallback: return mock data for demo if no API key
      return res.json({
        items: [
          {
            id: { videoId: 'dQw4w9WgXcQ' },
            snippet: {
              title: 'Rick Astley - Never Gonna Give You Up',
              channelTitle: 'Rick Astley',
              thumbnails: { medium: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' } }
            }
          },
          {
            id: { videoId: 'kJQP7kiw5Fk' },
            snippet: {
              title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
              channelTitle: 'Luis Fonsi',
              thumbnails: { medium: { url: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg' } }
            }
          },
          {
            id: { videoId: 'JGwWNGJdvx8' },
            snippet: {
              title: 'Ed Sheeran - Shape of You',
              channelTitle: 'Ed Sheeran',
              thumbnails: { medium: { url: 'https://i.ytimg.com/vi/JGwWNGJdvx8/mqdefault.jpg' } }
            }
          }
        ]
      });
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: q,
        type: 'video',
        videoCategoryId: '10', // Music category
        maxResults: 20,
        key: apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('YouTube search error:', error.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get video details
app.get('/api/video/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return res.json({
        items: [{
          id: id,
          snippet: {
            title: 'Demo Song',
            channelTitle: 'Demo Artist',
            thumbnails: { medium: { url: `https://i.ytimg.com/vi/${id}/mqdefault.jpg` } }
          },
          contentDetails: { duration: 'PT3M30S' }
        }]
      });
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet,contentDetails',
        id: id,
        key: apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Video details error:', error.message);
    res.status(500).json({ error: 'Failed to get video details' });
  }
});

// Lyrics API - lrclib
app.get('/api/lyrics', async (req, res) => {
  try {
    const { title, artist } = req.query;
    if (!title || !artist) {
      return res.status(400).json({ error: 'Title and artist required' });
    }

    // Try lrclib first
    try {
      const lrclibResponse = await axios.get('https://lrclib.net/api/search', {
        params: { q: `${title} ${artist}` },
        timeout: 5000
      });

      if (lrclibResponse.data && lrclibResponse.data.length > 0) {
        const track = lrclibResponse.data[0];
        return res.json({
          source: 'lrclib',
          title: track.trackName,
          artist: track.artistName,
          synced: track.syncedLyrics || null,
          plain: track.plainLyrics || track.syncedLyrics?.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '') || null
        });
      }
    } catch (lrclibError) {
      console.log('lrclib failed, trying lyrics.ovh');
    }

    // Fallback to lyrics.ovh
    try {
      const lyricsResponse = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, {
        timeout: 5000
      });

      if (lyricsResponse.data && lyricsResponse.data.lyrics) {
        return res.json({
          source: 'lyrics.ovh',
          title,
          artist,
          synced: null,
          plain: lyricsResponse.data.lyrics
        });
      }
    } catch (ovhError) {
      console.log('lyrics.ovh also failed');
    }

    res.json({
      source: null,
      title,
      artist,
      synced: null,
      plain: null,
      message: 'Lyrics not available'
    });
  } catch (error) {
    console.error('Lyrics error:', error.message);
    res.status(500).json({ error: 'Failed to fetch lyrics' });
  }
});

// AI Recommendations - OpenRouter
app.post('/api/recommendations', async (req, res) => {
  try {
    const { userId, listeningPattern } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      // Return default recommendations if no API key
      return res.json({
        recommendations: [
          { title: 'Blinding Lights', artist: 'The Weeknd' },
          { title: 'Levitating', artist: 'Dua Lipa' },
          { title: 'Peaches', artist: 'Justin Bieber' },
          { title: 'Good 4 U', artist: 'Olivia Rodrigo' },
          { title: 'Montero', artist: 'Lil Nas X' }
        ]
      });
    }

    const prompt = `Based on this user's listening pattern, recommend 5 songs they would enjoy:

Top Genres: ${JSON.stringify(listeningPattern?.genres || {})}
Top Artists: ${JSON.stringify(listeningPattern?.artists || {})}

Return ONLY a JSON array with objects containing "title" and "artist" fields. No other text.`;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'minimax/minimax-m2.5:free',
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const content = response.data.choices[0].message.content;
    let recommendations;
    
    try {
      // Try to parse JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (parseError) {
      // Fallback recommendations
      recommendations = [
        { title: 'Blinding Lights', artist: 'The Weeknd' },
        { title: 'Levitating', artist: 'Dua Lipa' },
        { title: 'Peaches', artist: 'Justin Bieber' }
      ];
    }

    res.json({ recommendations });
  } catch (error) {
    console.error('AI recommendations error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get recommendations',
      recommendations: [
        { title: 'Blinding Lights', artist: 'The Weeknd' },
        { title: 'Levitating', artist: 'Dua Lipa' }
      ]
    });
  }
});

// User Routes
app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let user = await User.findOne({ userId })
      .populate('likedSongs')
      .populate('playlists.songs')
      .populate('listeningHistory.song');

    if (!user) {
      user = new User({ userId });
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Like/Unlike song
app.post('/api/user/:userId/like', async (req, res) => {
  try {
    const { userId } = req.params;
    const { song } = req.body;

    // Save or get song
    let songDoc = await Song.findOne({ youtubeId: song.youtubeId });
    if (!songDoc) {
      songDoc = new Song(song);
      await songDoc.save();
    }

    const user = await User.findOne({ userId });
    const isLiked = user.likedSongs.includes(songDoc._id);

    if (isLiked) {
      user.likedSongs = user.likedSongs.filter(id => !id.equals(songDoc._id));
    } else {
      user.likedSongs.push(songDoc._id);
    }

    await user.save();
    res.json({ liked: !isLiked, song: songDoc });
  } catch (error) {
    console.error('Like song error:', error.message);
    res.status(500).json({ error: 'Failed to like/unlike song' });
  }
});

// Add to listening history
app.post('/api/user/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { song, duration, genre, artist } = req.body;

    // Save or get song
    let songDoc = await Song.findOne({ youtubeId: song.youtubeId });
    if (!songDoc) {
      songDoc = new Song(song);
      await songDoc.save();
    }

    const user = await User.findOne({ userId });
    
    // Add to history
    user.listeningHistory.unshift({ song: songDoc._id, duration });
    if (user.listeningHistory.length > 100) {
      user.listeningHistory = user.listeningHistory.slice(0, 100);
    }

    // Update listening pattern
    if (genre) {
      user.listeningPattern.genres.set(genre, (user.listeningPattern.genres.get(genre) || 0) + 1);
    }
    if (artist) {
      user.listeningPattern.artists.set(artist, (user.listeningPattern.artists.get(artist) || 0) + 1);
    }

    await user.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Add history error:', error.message);
    res.status(500).json({ error: 'Failed to add to history' });
  }
});

// Create playlist
app.post('/api/user/:userId/playlists', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name } = req.body;

    const user = await User.findOne({ userId });
    user.playlists.push({ name, songs: [] });
    await user.save();

    res.json(user.playlists[user.playlists.length - 1]);
  } catch (error) {
    console.error('Create playlist error:', error.message);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Add song to playlist
app.post('/api/user/:userId/playlists/:playlistId/songs', async (req, res) => {
  try {
    const { userId, playlistId } = req.params;
    const { song } = req.body;

    let songDoc = await Song.findOne({ youtubeId: song.youtubeId });
    if (!songDoc) {
      songDoc = new Song(song);
      await songDoc.save();
    }

    const user = await User.findOne({ userId });
    const playlist = user.playlists.id(playlistId);
    
    if (!playlist.songs.includes(songDoc._id)) {
      playlist.songs.push(songDoc._id);
      await user.save();
    }

    res.json(playlist);
  } catch (error) {
    console.error('Add to playlist error:', error.message);
    res.status(500).json({ error: 'Failed to add to playlist' });
  }
});

// Get liked songs
app.get('/api/user/:userId/liked', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId }).populate('likedSongs');
    res.json(user.likedSongs);
  } catch (error) {
    console.error('Get liked songs error:', error.message);
    res.status(500).json({ error: 'Failed to get liked songs' });
  }
});

// Get recently played
app.get('/api/user/:userId/recent', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId })
      .populate('listeningHistory.song')
      .slice('listeningHistory', 20);
    res.json(user.listeningHistory);
  } catch (error) {
    console.error('Get recent error:', error.message);
    res.status(500).json({ error: 'Failed to get recent songs' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../app/dist/index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
