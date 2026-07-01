# Deployment Checklist — FarmFriend

This document lists the recommended steps and settings to prepare FarmFriend for professional, global deployment.

1) Environment variables (backend)
   - MONGO_URI — connection string for production MongoDB
   - JWT_SECRET — strong secret for signing tokens
   - CLIENT_URL — frontend base URL (e.g., https://yourdomain.com)
   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET — optional for image hosting
   - ENABLE_LEGACY_AUTH_ROUTE — set to `true` only if you need `/auth` compatibility
   - NODE_ENV=production

2) Backend
   - Ensure `backend/package.json` has `start` script (uses `node server.js`). For process managers use `pm2 start server.js --name farmfriend`.
   - Configure CORS via `CLIENT_URL` or allowlist in `server.js` (already implemented).
   - Use HTTPS via your hosting provider or reverse proxy (NGINX, Cloudflare). Do not terminate TLS in Node directly in production.
   - Keep `uploads/` backed by a persistent storage (S3 or Cloudinary). Prefer Cloudinary for CDN and reliability.

3) Frontend
   - `npm run build` to generate a production bundle. This repo includes `homepage` set to `.` so assets are referenced relatively by default.
   - Recommended hosts: Netlify, Vercel, or static CDN+reverse-proxy. If deploying to a subpath, set `homepage` to the subpath (e.g., `/your-app/`) or configure `BrowserRouter` `basename`.
   - Ensure API calls in the frontend use either `process.env.REACT_APP_API_URL` (set at build time) or relative paths `/api/...` if served from same domain.

4) CI / Build
   - Build on CI (GitHub Actions/GitLab CI) and upload artifacts or let the host build.
   - Add vulnerability scanning and linting steps in CI.

5) Monitoring & Logs
   - Use centralized logging (Papertrail/LogDNA/CloudWatch) and performance monitoring (Sentry/NewRelic).
   - Set up health checks (e.g., GET / -> status) for load balancer.

6) Security
   - Set secure cookie flags, rate limiting, and validate inputs server-side.
   - Enforce HTTPS, HSTS, and use CSP headers where appropriate.

7) Rollout
   - Use staged rollout (canary) and smoke tests post-deploy.
   - Keep database backups and migration strategy ready.

8) Quick deploy commands (example)
   - Frontend build (local):
     ```bash
     cd frontend
     npm ci
     npm run build
     ```

   - Backend start (production):
     ```bash
     cd backend
     npm ci --production
     NODE_ENV=production MONGO_URI="your-mongo-uri" JWT_SECRET="..." node server.js
     ```

If you want, I can create GitHub Actions CI config to build and deploy automatically to Netlify/Heroku/Docker.
