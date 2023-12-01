import rateLimit from 'express-rate-limit'
import { readEnv, readEnvAsMilliseconds } from '../setup/readEnv'

const generalRateLimitWindow = readEnvAsMilliseconds('GENERAL_RATE_LIMIT_WINDOW', '15m')
const generalRateLimitMax = readEnv('GENERAL_RATE_LIMIT_MAX', 300, true) as number // 300 requests per window default

const authRateLimitWindow = readEnvAsMilliseconds('AUTH_RATE_LIMIT_WINDOW', '1h') // 1 hour window default
const authRateLimitMax = readEnv('AUTH_RATE_LIMIT_MAX', 10, true) as number // 10 requests per window default

export const generalRateLimiter = rateLimit({
  windowMs: generalRateLimitWindow,
  max: generalRateLimitMax,
  message: JSON.stringify({
    message: 'Too many requests, please try again later.'
  })
})

// Auth rate limiter is used for login routes
// This is to prevent brute force attacks
export const authRateLimiter = rateLimit({
  windowMs: authRateLimitWindow,
  max: authRateLimitMax,
  message: JSON.stringify({
    message: 'Too many Login Attempts, please try again later.'
  })

})
