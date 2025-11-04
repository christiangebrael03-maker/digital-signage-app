# Signage Minimal — README (Simple deploy)

This is a minimal cloud-ready signage app.
- Control UI: `/control.html`
- TV view: `/tv.html?screen=screen-1` (replace screen-1..screen-5)

It uses Cloudinary for cloud storage. You must create a free Cloudinary account and set the following environment variables in your host (Glitch/Render/Vercel):
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

## Quick steps (the easiest path using Glitch)
1. Create a free account at https://glitch.com (or use Render as alternate).
2. Click "New Project" → "Import from GitHub" or "Upload a ZIP".
   - If Glitch asks, upload the ZIP you got from me (`signage_minimal.zip`).
3. In the Glitch project, open the `.env` file (Environment variables) and add your Cloudinary creds:
   CLOUDINARY_CLOUD_NAME=yourcloudname
   CLOUDINARY_API_KEY=yourkey
   CLOUDINARY_API_SECRET=yoursecret
4. Glitch will install dependencies and run. Open the "Show" link or the project URL.
5. Open `/control.html` to upload (pick screen then upload). Open `/tv.html?screen=screen-1` on any device to show that screen. Repeat for screen-2..screen-5 by changing the `screen` query param.

## Alternative: Deploy on Render (recommended for more stable uptime)
1. Push this project to GitHub.
2. Create a Web Service on Render, connect the repo, set Build Command `npm install`, Start Command `npm start`.
3. Add the Cloudinary env vars in the Render dashboard.
4. Deploy and open `/control.html` and `/tv.html?screen=screen-1`.

## Notes & minimal maintenance
- This demo stores latest urls in memory. Cloudinary stores the files permanently in your account. If the server restarts, the in-memory map will be empty until you re-upload or extend the server to persist metadata (optional).
- This is intentionally minimal: no auth, no DB. Secure it later if needed.

