# Vercel Deployment Checklist

This guide provides instructions and required settings for deploying Film Finder to Vercel.

## 1. Required Environment Variables

Configure the following environment variables in your Vercel Project Settings (**Settings > Environment Variables**):

| Variable Name | Required | Description |
|---|---|---|
| `TMDB_API_KEY` | **Yes** | Your The Movie Database (TMDB) v3 API key. |
| `OPENAI_API_KEY` | **Yes** | Your OpenAI API key for `gpt-4o-mini` query interpretation & candidate ranking. |
| `RATE_LIMIT_PER_MINUTE` | No | Optional integer overriding the default rate limit of 20 requests per client IP per minute. |

> **Security Note:** Neither `TMDB_API_KEY` nor `OPENAI_API_KEY` use the `NEXT_PUBLIC_` prefix. They are strictly server-side credentials and are never exposed or bundled into client JavaScript.

## 2. Build Settings

- **Framework Preset**: Next.js
- **Build Command**: `next build` (or `npm run build`)
- **Output Directory**: `.next`
- **Node.js Version**: 20.x or 22.x LTS

## 3. Production Security Headers

The following HTTP response headers are automatically applied by `next.config.ts`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## 4. Verification

Run local verification commands before pushing:
```bash
npm run build
npm test
```
