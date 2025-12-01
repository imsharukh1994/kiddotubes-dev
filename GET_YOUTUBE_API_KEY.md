# 🎥 How to Get YouTube API Key

Your KiddoTubes app needs a YouTube Data API v3 key to display real videos. Follow these steps:

## Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account (create one if needed)

## Step 2: Create a New Project

1. Click the **project dropdown** at the top
2. Click **"NEW PROJECT"**
3. Enter project name: `KiddoTubes`
4. Click **CREATE**
5. Wait for the project to be created (this takes ~30 seconds)

## Step 3: Enable YouTube Data API v3

1. In the search bar at the top, type: `YouTube Data API v3`
2. Click on **YouTube Data API v3** from the results
3. Click **ENABLE** button
4. Wait for it to enable (you'll see "API enabled" message)

## Step 4: Create API Key

1. On the left sidebar, click **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** button
3. Select **"API Key"** from the dropdown
4. A popup will show your new API key
5. Click **"COPY"** to copy it

## Step 5: Add Key to .env File

1. Open the `.env` file in the project root
2. Find this line:
   ```
   YOUTUBE_API_KEY=your_youtube_api_key
   ```
3. Replace it with:
   ```
   YOUTUBE_API_KEY=your_actual_key_here
   ```
   (Paste the key you copied from Google Cloud)

**Example:**
```
YOUTUBE_API_KEY=AIzaSyD_L_oFDXl-KWQ7l1qrIXsH8q8_1234567890
```

## Step 6: Restart the Backend Server

1. Stop the backend server (Ctrl+C)
2. Run it again:
   ```bash
   npm run server
   ```

## Step 7: Test it Works

Open in your browser:
```
http://localhost:5000/api/videos?q=kids
```

You should see real YouTube videos instead of sample videos.

---

## ⚠️ Important: Restrict Your API Key

**SECURITY**: Your API key is now in `.env` which is protected by `.gitignore`, but it's still exposed if anyone sees your computer. To make it safer:

1. Go back to Google Cloud Console
2. Click on your API key from the Credentials page
3. Click **"RESTRICT KEY"**
4. Under "API restrictions", select **"YouTube Data API v3"** only
5. Under "Application restrictions", select **"HTTP referrers (web sites)"**
6. Add your domain (for now, you can skip this)
7. Click **SAVE**

This ensures the key only works for YouTube API requests.

---

## Troubleshooting

### "API key not valid" error
- Make sure you enabled **YouTube Data API v3** (not just YouTube Data API)
- Wait 5-10 minutes after enabling - sometimes it takes time to activate
- Check the key is copied correctly in .env

### Still seeing "sample videos"
- Restart the backend server after updating .env
- Make sure there are no spaces around the key in .env
- Check that `NODE_ENV=development` in .env (it's needed for YouTube API)

### "quota exceeded" error
- YouTube API has free tier limits (10,000 queries/day)
- If exceeded, wait 24 hours or upgrade to paid plan

---

## Free Tier Limits

- **Quota**: 10,000 queries per day
- **Rate**: No per-second limit for free tier
- **Videos**: Returns up to 500 videos per search

This is more than enough for testing!

---

## Next Steps

Once you have the API key:
1. Add it to `.env`
2. Restart backend server
3. Test at http://localhost:5000/api/videos?q=kids
4. Open frontend at http://localhost:8005
5. Search for videos - real YouTube videos should appear!

---

**Questions?** The YouTube API is active and ready once you add the key!
