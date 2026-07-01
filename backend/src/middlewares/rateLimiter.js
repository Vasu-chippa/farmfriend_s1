import rateLimit from 'express-rate-limit';

// Generic rate limiter for sensitive endpoints (auth)
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

export default authRateLimiter;
