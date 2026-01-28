# Security Scan False Positive - api.js

## Issue
Security scanner flagged `frontend/src/api.js:3` as containing a potential API key.

## Analysis
This is a **FALSE POSITIVE**. The line in question is:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

## Why This Is Not a Vulnerability

1. **`VITE_API_URL` is a URL, not an API key**
   - This environment variable stores the backend server address (e.g., `https://dunesday-backend.onrender.com`)
   - URLs are meant to be public - they're how browsers connect to servers
   - This is equivalent to typing a website address in your browser

2. **No sensitive data is exposed**
   - The actual TMDB API key is stored securely in the backend's `.env` file
   - The frontend never has access to the TMDB API key
   - The frontend only knows where to send requests (the URL)

3. **This is standard practice**
   - All web applications need to know their backend URL
   - Vite's `import.meta.env` is the recommended way to configure this
   - The URL is already visible in browser network requests anyway

## Security Scanner Limitation

Many automated security scanners flag any use of `import.meta.env.*` or `process.env.*` as potential secrets because they can't distinguish between:
- **Actual secrets** (API keys, passwords, tokens)
- **Configuration values** (URLs, feature flags, public settings)

## Resolution

Added a clarifying comment in the code to document that this is a URL endpoint, not a secret. The security team can mark this as a false positive in their scanning tool.

## Actual Security Measures in Place

✅ Real API keys are in backend `.env` (not committed to Git)
✅ CORS restricts which domains can call the API
✅ Frontend only stores non-sensitive configuration
✅ All secrets are server-side only
