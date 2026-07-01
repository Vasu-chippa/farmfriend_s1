# Backend Deployment Notes for Render

Use this file to keep deployment-specific environment settings for Render.

## Required Render Environment Variables
- `PORT` = `5001`
- `MONGO_URI` = your production MongoDB URI
- `JWT_SECRET` = strong random secret
- `CLIENT_URL` = `https://<your-netlify-site>.netlify.app`
- `CORS_ALLOW_ALL` = `false`
- `ALLOW_DEPLOY_SUBDOMAINS` = `true`
- `ALLOWED_ORIGINS` = `https://<your-netlify-site>.netlify.app,https://<other-deploy-domain>`
- `NODE_ENV` = `production`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Recommended Render settings
- Use `node server.js` as the start command.
- Set the `root` to the backend repo root.
- Add a health check for `/` or `/api/health` if you add one.

## CORS behavior
- `CLIENT_URL` is used to allow origin in production.
- If `ALLOW_DEPLOY_SUBDOMAINS=true`, Render and Netlify deploy domains matching `*.render.com` or `*.netlify.app` are permitted.
- If you need a specific list of origins, set `ALLOWED_ORIGINS`.
