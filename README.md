# 🎧 KaiiMusicPlayer

A full-stack YouTube-powered music streaming application with AI recommendations, lyrics, and playlists. Built with a Spotify-inspired UI featuring liquid glass design effects.

![KaiiMusicPlayer](https://img.shields.io/badge/Kaii-Music%20Player-black?style=for-the-badge)

## ✨ Features

### 🎵 Music & Video
- **YouTube Integration**: Play music and official music videos via YouTube IFrame Player API
- **Background Playback**: Minimized player bar with full controls
- **Video Mode**: Switch between audio and video modes in the expanded player
- **High Quality Audio**: Extract audio-like experience from YouTube videos

### 🎤 Lyrics System
- **Synced Lyrics**: Karaoke-style lyrics with real-time highlighting (when available)
- **Static Lyrics**: Fallback to plain text lyrics
- **Multiple Sources**: Uses lrclib.net and lyrics.ovh APIs
- **Auto-fetch**: Lyrics automatically load when a song plays

### 🔍 Search System
- **YouTube Search**: Search millions of songs via YouTube API
- **Instant Play**: Click any result to start playing immediately
- **Genre Browse**: Browse by popular genres (Pop, Rock, Hip Hop, etc.)

### 🤖 AI Recommendations
- **OpenRouter Integration**: Uses `minimax/minimax-m2.5:free` model
- **Listening Pattern Analysis**: Tracks genres, artists, and moods
- **Personalized Suggestions**: AI recommends songs based on your taste

### 📚 Library & Playlists
- **Liked Songs**: Save your favorite tracks
- **Recently Played**: Automatic history tracking
- **Custom Playlists**: Create and manage your own playlists
- **Queue Management**: View and manage upcoming songs

### 🎨 UI/UX
- **Spotify-like Design**: Familiar, intuitive interface
- **Liquid Glass Effects**: iOS 26-style frosted glass aesthetics
- **Dark Theme**: Black & white color scheme
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Layout**: Works on desktop and tablet

## 🛠 Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - UI component library
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **Axios** - HTTP client

### APIs
- **YouTube Data API** - Search and video data
- **YouTube IFrame Player API** - Video playback
- **lrclib.net** - Synced lyrics
- **lyrics.ovh** - Plain lyrics fallback
- **OpenRouter** - AI recommendations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- YouTube Data API key
- OpenRouter API key (optional, for AI recommendations)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd KaiiMusicPlayer
```

2. **Install frontend dependencies**
```bash
cd app
npm install
```

3. **Install backend dependencies**
```bash
cd ../server
npm install
```

4. **Set up environment variables**

Create `.env` file in `/server`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kaiimusic
YOUTUBE_API_KEY=your_youtube_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Create `.env` file in `/app`:
```env
VITE_API_URL=http://localhost:5000/api
```

5. **Get YouTube API Key**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project
- Enable YouTube Data API v3
- Create credentials (API Key)
- Copy the key to your `.env` file

6. **Get OpenRouter API Key (Optional)**
- Go to [OpenRouter](https://openrouter.ai/)
- Sign up and get an API key
- Copy the key to your `.env` file

### Running the Application

1. **Start MongoDB** (if using local)
```bash
mongod
```

2. **Start the backend server**
```bash
cd server
npm start
```

3. **Start the frontend (development)**
```bash
cd app
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:5173`

### Production Build

1. **Build the frontend**
```bash
cd app
npm run build
```

2. **Start production server**
```bash
cd server
npm start
```

The server will serve the built frontend at `http://localhost:5000`

## 📁 Project Structure

```
KaiiMusicPlayer/
├── app/                    # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── sections/       # Page sections
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx         # Main app component
│   │   └── index.css       # Global styles
│   ├── dist/               # Production build
│   └── package.json
├── server/                 # Backend Express server
│   ├── index.js            # Main server file
│   ├── package.json
│   └── .env
└── README.md
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search` | GET | Search YouTube videos |
| `/api/video/:id` | GET | Get video details |
| `/api/lyrics` | GET | Fetch song lyrics |
| `/api/recommendations` | POST | Get AI recommendations |
| `/api/user/:userId` | GET | Get user data |
| `/api/user/:userId/like` | POST | Like/unlike song |
| `/api/user/:userId/history` | POST | Add to history |
| `/api/user/:userId/playlists` | POST | Create playlist |
| `/api/user/:userId/playlists/:id/songs` | POST | Add song to playlist |
| `/api/user/:userId/liked` | GET | Get liked songs |
| `/api/user/:userId/recent` | GET | Get recently played |

## 🎨 Design System

### Colors
- Background: `#000000` (Pure black)
- Surface: `rgba(255, 255, 255, 0.05)` (Glass effect)
- Text Primary: `#FFFFFF`
- Text Secondary: `rgba(255, 255, 255, 0.6)`
- Accent: `#FFFFFF` (White)

### Glass Effect
```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Credits

- YouTube for the video/audio content
- lrclib.net for synced lyrics
- lyrics.ovh for plain lyrics
- OpenRouter for AI recommendations

---

Built with ❤️ by Kaii Team
