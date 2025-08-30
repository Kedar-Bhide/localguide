# LocalGuide MVP - Manual Platform Setup Steps

## Prerequisites
- GitHub repo: `localguide` (✅ already created)
- Supabase project: `localguide` (✅ already created)

## 1. Supabase Configuration

### A. Get Your Project Credentials
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click on your `localguide` project
3. In the left sidebar, click **Settings** → **API**
4. **SAVE THESE VALUES** (you'll need them later):
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon public key** (starts with `eyJhbG...`)
   - **service_role key** (starts with `eyJhbG...` - keep this secret!)

### B. Configure Authentication
1. In your Supabase project dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, enter: `http://localhost:3000` (for development)
3. Under **Redirect URLs**, add: `http://localhost:3000/auth/callback`
4. Scroll down to **Auth Providers** → **Email**
5. Make sure **Enable email confirmations** is turned ON
6. Set **Confirm email template** subject to: `Confirm your LocalGuide account`

### C. Set up Storage Bucket
1. Go to **Storage** in the left sidebar
2. Click **Create Bucket**
3. Name: `avatars`
4. Set **Public bucket** to ON
5. Click **Create bucket**
6. Click on the `avatars` bucket you just created
7. Click **Settings** (gear icon)
8. Under **MIME types**, add: `image/jpeg, image/png, image/webp`
9. Set **File size limit** to: `2MB`

## 2. Google Cloud Platform Setup

### A. Create a Google Cloud Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown (top-left, next to "Google Cloud")
3. Click **NEW PROJECT**
4. Project name: `LocalGuide`
5. Click **CREATE**
6. Wait for the project to be created, then select it

### B. Enable Places API
1. In the left sidebar, click **APIs & Services** → **Library**
2. Search for "Places API"
3. Click **Places API** (by Google)
4. Click **ENABLE**

### C. Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API key**
3. **SAVE THIS API KEY** (looks like: `AIzaSy...`)
4. Click **RESTRICT KEY** (recommended for security)
5. Under **Application restrictions**, select **HTTP referrers**
6. Add these referrers:
   - `http://localhost:3000/*`
   - `https://yourdomain.vercel.app/*` (you'll update this later)
7. Under **API restrictions**, select **Restrict key**
8. Choose **Places API** from the dropdown
9. Click **SAVE**

## 3. Vercel Setup

### A. Connect GitHub Repository
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New** → **Project**
3. Find your `localguide` repository and click **Import**
4. **Framework Preset**: Select **Vite** (or **Next.js** if using Next.js)
5. **Root Directory**: Leave as `./`
6. **DO NOT DEPLOY YET** - we need to add environment variables first

### B. Add Environment Variables
1. Before clicking **Deploy**, scroll down to **Environment Variables**
2. Add these variables one by one:

   | Name | Value | Notes |
   |------|--------|--------|
   | `VITE_SUPABASE_URL` | Your Supabase Project URL | From Step 1A |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | From Step 1A |
   | `VITE_GOOGLE_PLACES_API_KEY` | Your Google Places API key | From Step 2C |

3. Click **Deploy** once all environment variables are added

### C. Get Your Vercel Domain
1. After deployment completes, you'll see your app URL (like: `https://localguide-abc123.vercel.app`)
2. **SAVE THIS URL** - you'll need it for the next step

## 4. Update Supabase with Production URL

### A. Update Auth Settings
1. Go back to your Supabase project → **Authentication** → **Settings**
2. Under **Site URL**, change from `http://localhost:3000` to your Vercel URL
3. Under **Redirect URLs**, add your Vercel URL + `/auth/callback`
   - Example: `https://localguide-abc123.vercel.app/auth/callback`
4. Click **Save**

## 5. Update Google Cloud Restrictions

1. Go back to Google Cloud Console → **APIs & Services** → **Credentials**
2. Click on your API key
3. Under **HTTP referrers**, add your Vercel domain:
   - `https://localguide-abc123.vercel.app/*`
4. Click **SAVE**

## 6. Important Security Notes

- **NEVER** commit the `service_role` key to GitHub
- The `anon` key is safe to use in frontend code
- Always use environment variables for API keys
- Keep your Google Places API usage minimal to stay in free tier

## Next Steps

Once these manual steps are complete, you'll be ready for code implementation. The developer will provide:
- Complete React frontend code
- Supabase database schema and RLS policies
- Environment configuration files
- Deployment instructions

## Troubleshooting

If you encounter issues:
1. Double-check all URLs match exactly (no extra slashes)
2. Verify environment variables are spelled correctly
3. Make sure all APIs are enabled in Google Cloud
4. Confirm your Supabase project is active and not paused