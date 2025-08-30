# Gate A - Production Deployment Checklist

## Pre-Deployment Verification ✅

### Build Status
- [x] **Build Success**: `npm run build` completes without errors
- [x] **TypeScript**: All type checks pass
- [x] **Routes**: All 8 pages compile successfully
- [x] **Dependencies**: All packages installed correctly

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Vercel Deployment Steps

1. **Connect Repository**
   - Link GitHub repo to Vercel
   - Import project from `/Users/kedarb/Desktop/localguide`

2. **Configure Environment Variables**
   - Add `NEXT_PUBLIC_SUPABASE_URL` in Vercel dashboard
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel dashboard

3. **Build Settings**
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)
   - Node.js Version: 18.x

## Manual Testing Protocol

### Authentication Flow Test
1. **Signup Flow**
   - [ ] Navigate to `/join` → "Join as Traveler"
   - [ ] Fill form: name, email, password
   - [ ] Submit → see "Check your email to confirm"
   - [ ] Check email for confirmation link
   - [ ] Click confirmation link

2. **Login Flow** 
   - [ ] Navigate to `/login`
   - [ ] Enter confirmed credentials
   - [ ] Submit → redirects to `/explore`
   - [ ] Header shows user name and profile dropdown

3. **Profile Creation**
   - [ ] Check Supabase Dashboard → profiles table
   - [ ] Verify new row created with user data
   - [ ] Confirm `is_traveler=true`, `is_local=false`

### RLS Security Validation
4. **Row Level Security Test**
   - [ ] Create second test user account
   - [ ] In browser console, attempt to update another user's profile:
   ```javascript
   const { error } = await supabase
     .from('profiles')
     .update({ full_name: 'Hacked' })
     .eq('id', 'other_user_id')
   ```
   - [ ] **Expected Result**: Error (RLS policy blocks update)
   - [ ] Verify original profile data unchanged

## Success Criteria
- [x] **Deployment**: Site accessible at Vercel URL
- [ ] **Authentication**: Complete signup → confirm → login flow works
- [ ] **Database**: Profile created in Supabase
- [ ] **Security**: RLS prevents unauthorized profile updates
- [ ] **Navigation**: Protected routes redirect properly

## Post-Deployment Actions
- [ ] Document production URL
- [ ] Save deployment notes
- [ ] Commit validation results
- [ ] Ready for Milestone 2

---

**Gate A Status**: ⏳ In Progress
**Production URL**: TBD after deployment
**Database**: Supabase (configured)
**RLS Status**: TBD (pending validation)