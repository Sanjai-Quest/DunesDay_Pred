# Security Vulnerability Fixes

This document outlines the security vulnerabilities that were identified and fixed in the DunesDay Prediction project.

## Vulnerabilities Fixed

### 1. Hardcoded API Keys (CRITICAL) - 3 instances
**Files affected:**
- `backend/media_service.py` (Line 8)
- `fetch_movies.py` (Line 4)
- `frontend/src/api.js` (Line 3)

**Issue:** TMDB API keys were hardcoded directly in the source code, exposing them to anyone with repository access.

**Fix:**
- Created `.env` file to store sensitive credentials
- Added `python-dotenv` dependency to load environment variables
- Updated all files to read `TMDB_API_KEY` from environment variables
- Added validation to ensure the API key is set before running
- Created `.env.example` template for other developers

### 2. Wildcard CORS Configuration (HIGH)
**File affected:** `backend/main.py` (Line 24)

**Issue:** The CORS middleware was configured with `allow_origins=["*"]`, allowing any website to make requests to the API. This creates a security risk for Cross-Site Request Forgery (CSRF) attacks.

**Fix:**
- Replaced wildcard `["*"]` with environment-based whitelist
- Added `ALLOWED_ORIGINS` environment variable
- Restricted allowed methods to only `GET` and `POST`
- Restricted allowed headers to only `Content-Type` and `Authorization`
- Default configuration includes localhost for development

## Configuration

### Environment Variables
Create a `.env` file in the project root with the following variables:

```env
# TMDB API Configuration
TMDB_API_KEY=your_actual_api_key_here

# CORS Configuration (comma-separated)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://your-production-domain.com
```

### For Production Deployment (Render)
Add these environment variables in the Render dashboard:
1. `TMDB_API_KEY` - Your TMDB API key
2. `ALLOWED_ORIGINS` - Your frontend URL (e.g., `https://dunesday-frontend-sm6b.onrender.com`)

## Security Best Practices Implemented

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use `.env.example`** - Template provided for team members
3. **Validate environment variables** - Code raises errors if required variables are missing
4. **Principle of least privilege** - CORS restricted to specific origins and methods
5. **Separation of concerns** - Configuration separated from code

## Testing After Fix

1. Install the new dependency:
   ```bash
   pip install python-dotenv
   ```

2. Create your `.env` file using `.env.example` as a template

3. Run the application to verify it works:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

## Notes

- The `.env` file is already in `.gitignore` and will not be committed to the repository
- Share the actual API key securely with team members (not via Git)
- Update `ALLOWED_ORIGINS` when deploying to new domains
