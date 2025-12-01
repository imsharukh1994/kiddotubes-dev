# 🎬 KiddoTubes - Safe Video Platform for Kids

A kid-safe video platform with advanced content filtering, parental controls, and multi-language support. Features email/password authentication, Google Sign-In, and phone OTP login.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)

## ✨ Features

- 🔐 **Multiple Authentication Methods**
  - Email/Password registration and login
  - Google Sign-In
  - Phone OTP verification

- 🎥 **Video Management**
  - Safe video streaming
  - Content filtering with blocked keywords
  - Watch history tracking

- 👨‍👩‍👧‍👦 **Parental Controls**
  - Age-group based content filtering (2-4, 5-7, 8-12)
  - Safe search enabled by default
  - Customizable filtering preferences

- 🌐 **Multi-Language Support**
  - English, Hindi, and more

- 📱 **Responsive Design**
  - Works on desktop, tablet, and mobile browsers

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (free tier available)
- Firebase account (optional, for advanced features)
- YouTube API key (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/kiddotubes.git
cd kiddotubes
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/kiddotubes

# Firebase (get from Firebase Console)
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id

# YouTube API (get from Google Cloud Console)
YOUTUBE_API_KEY=your_youtube_api_key
```

### 4. Start the Application

**Option A: Run both server and frontend**
```bash
npm start
```

**Option B: Run server only**
```bash
npm run server
```

**Option C: Run frontend only (development)**
```bash
npm run serve
```

### 5. Open in Browser

Visit: `http://localhost:8005`

## 📖 Testing Guide for Friends & Family

### Testing Authentication

1. **Email/Password Registration**
   - Click Profile icon (top-right)
   - Select "Register"
   - Fill in email and password
   - Click "Create Account"

2. **Google Sign-In**
   - Click Profile icon
   - Select "Sign in with Google"
   - Complete Google authentication

3. **Phone OTP**
   - Click Profile icon
   - Select "Sign in with Phone"
   - Enter phone number
   - Enter received OTP

### Testing Content Filtering

1. Search for videos
2. Content is automatically filtered based on:
   - Age group setting
   - Blocked keywords list
   - Safe search preference

3. Check Watch History
   - View previously watched videos
   - See timestamps

### Testing Different Age Groups

- Go to Settings
- Select age group (2-4, 5-7, or 8-12)
- Content updates to match age appropriateness

## 🛠️ Development

### Project Structure

```
kiddotubes/
├── index.html          # Main app interface
├── parent.html         # Parent dashboard
├── player.html         # Video player
├── server.js           # Express backend
├── auth.js             # Authentication logic
├── parent.js           # Parent features
├── player.js           # Player functionality
├── style.css           # Main styles
├── package.json        # Dependencies
└── Assest/             # Images and assets
```

### Available Scripts

```bash
npm start              # Start server & open app
npm run server         # Start Express server only
npm run serve          # Start HTTP server (frontend only)
npm run dev            # Start server with live reload
npm run server:dev     # Start with Nodemon for backend development
```

### Key Dependencies

- **Express** - Backend web framework
- **Mongoose** - MongoDB ODM
- **Firebase** - Authentication & real-time database
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📱 Mobile Apps (React Native)

We offer both web and native mobile apps sharing the same backend!

- **Web**: Browser-based (current version)
- **iOS/Android**: Native apps with React Native
- **Shared Backend**: Same user accounts, videos, and watch history

### Getting Started with Mobile

See [REACT_NATIVE_SETUP.md](./REACT_NATIVE_SETUP.md) for detailed instructions.

Quick start:
```bash
npx create-expo-app KiddoTubes-Mobile
cd KiddoTubes-Mobile
npm install
npm start
```

Learn how web and mobile share data: [SHARED_BACKEND.md](./SHARED_BACKEND.md)

## 📚 Documentation

Detailed guides are available:
- [Authentication Setup](./docs/AUTH_QUICK_START.md)
- [MongoDB Integration](./docs/MONGODB_QUICK_START.md)
- [Content Filtering](./docs/FILTER_QUICK_REFERENCE.md)
- [React Native Setup](./REACT_NATIVE_SETUP.md)
- [Mobile App Starter](./MOBILE_APP_STARTER.md)
- [Shared Backend](./SHARED_BACKEND.md)
- [Testing Guide](./TESTING.md)

## 🔒 Security

- All sensitive credentials are in `.env` (not committed to Git)
- Use `.env.example` as template for setup
- Never commit `.env` file
- API keys and database credentials are secure

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 5000 is in use
# Change PORT in .env to another port (e.g., 5001)
```

### MongoDB connection fails
- Verify `MONGODB_URI` in `.env`
- Check MongoDB Atlas IP whitelist
- Ensure internet connection is stable

### Authentication not working
- Clear browser cookies/cache
- Check Firebase configuration in `.env`
- Verify API keys are correct

### Videos not loading
- Check YouTube API key is valid
- Ensure safe search filtering is appropriate

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👨‍💻 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: [your-email@example.com]

## 🎯 Roadmap

- [ ] Advanced parental dashboard
- [ ] Multi-device synchronization
- [ ] Offline viewing (PWA)
- [ ] Content recommendation engine
- [ ] Community features (safe comments)
- [ ] Admin moderation panel

## ⚡ Performance Tips

- Clear browser cache if experiencing issues
- Use latest browser version
- Ensure stable internet connection
- For large watch history, use incognito mode for testing

---

Made with ❤️ for kids' safety online
