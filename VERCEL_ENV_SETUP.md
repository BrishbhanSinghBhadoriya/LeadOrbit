# Vercel Environment Variables Setup

Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Your JWT access secret key |
| `JWT_REFRESH_SECRET` | Your JWT refresh secret key |
| `JWT_ACCESS_EXPIRES` | `8h` |
| `JWT_REFRESH_EXPIRES` | `30d` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_SOCKET_URL` | *(leave empty — Socket.IO not supported on Vercel)* |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

## Notes
- Socket.IO is disabled on Vercel (serverless). Real-time notifications won't work.
- For real-time features, use a dedicated server (Railway, Render, VPS) with `npm run start:server`
- MongoDB Atlas: Make sure to whitelist `0.0.0.0/0` in Network Access for Vercel IPs
