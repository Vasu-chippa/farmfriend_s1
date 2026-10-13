# FarmFriend

Deployment
==========

This repository is prepared for global deployment. Options:

Netlify (frontend) + Render (backend)
- Frontend: configure Netlify `build` command as `npm run build --prefix frontend` and `publish = frontend/build`, or set `base = "frontend"` and `command = "npm run build"` in `netlify.toml`.
- Backend: deploy to Render (or another host). Set environment variables on the host: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (Netlify URL), and any cloudinary/SMTP credentials.

Docker / Docker Compose
- Use the provided `docker-compose.yml` to run `mongo`, `backend`, and `frontend` locally or in a container host:

	docker-compose up --build

- Frontend is served by nginx on port 3000 (mapped to container 80); backend on port 5000.

Notes
- Do not commit secrets to the repo; use platform env vars or secrets managers.
- After backend deployment ensure CORS allows your frontend origin and the backend sets the `token` cookie with `SameSite=None` and `secure=true` in production.

CI/CD
- Add GitHub Actions or other CI to run tests and trigger builds/deploys. For Netlify and Render you can use their native continuous deploys from GitHub or trigger builds via their APIs using secrets.

