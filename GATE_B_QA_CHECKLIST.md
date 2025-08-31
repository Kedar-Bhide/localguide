# Gate B QA Testing Checklist

## Overview
This checklist covers all functionality implemented through Gate B, including authentication, user roles, search, feedback, and local profile management.

## 🔐 Authentication & User Management

### Traveler Signup/Login Flow
- [ ] **Traveler Signup (/traveler)**
  - [ ] Form validation (name min 2 chars, valid email, strong password)
  - [ ] Successful account creation
  - [ ] Email confirmation requirement
  - [ ] Profile created with `is_traveler=true`, `is_local=false`
  - [ ] Redirect to dashboard after confirmation

- [ ] **Login Flow (/login)**
  - [ ] Valid credentials allow login
  - [ ] Invalid credentials show error
  - [ ] Remember session across browser refresh
  - [ ] Password reset functionality
  - [ ] Redirect to appropriate dashboard based on role

- [ ] **Local Signup (/local)**
  - [ ] Form validation identical to traveler
  - [ ] Account creation with green theme styling
  - [ ] Profile created appropriately

### Header Authentication States
- [ ] **Logged Out Header**
  - [ ] Shows "Join", "Login", "Feedback" links
  - [ ] LocalGuide logo links to home

- [ ] **Logged In Traveler Header**
  - [ ] Shows "Become a Local" button when `is_local=false`
  - [ ] Shows user profile dropdown with logout
  - [ ] Shows "Feedback" link

- [ ] **Logged In Local Header**
  - [ ] Shows "My Traveler Profile" button when `is_local=true`
  - [ ] Shows "My Local Profile" in dropdown
  - [ ] Profile dropdown with logout

## 🏠 Static Pages & Navigation

### Landing Pages
- [ ] **Home Page (/home)**
  - [ ] No-scroll layout displays correctly
  - [ ] Left card: "How it works" with Traveler/Local columns (3 bullets each)
  - [ ] Right card: Functional search box (for logged-out users shows login modal)
  - [ ] 3 CTA cards at bottom with proper navigation
  - [ ] Copy-to-clipboard functionality works for "Spread the word"

- [ ] **Join Chooser (/join)**
  - [ ] "Join as Traveler" → routes to `/traveler`
  - [ ] "Join as Local" → routes to `/local`
  - [ ] "Already have an account? Login here" → routes to `/login`

### Feedback System
- [ ] **Feedback Form (/feedback)**
  - [ ] Form fields: name, email, comment (all required)
  - [ ] Validation: name 2+ chars, valid email, comment 10+ chars
  - [ ] Successful submission saves to database
  - [ ] Success modal with "Back to Home" button
  - [ ] Works for both anonymous and authenticated users

## 🔍 Search Functionality

### Search Form (Logged Out - /home)
- [ ] **Location Field**
  - [ ] Typeahead autocomplete shows city suggestions
  - [ ] Clicking suggestion populates field
  - [ ] Dropdown closes when clicking outside

- [ ] **Date Fields**
  - [ ] Start Date and End Date are date inputs
  - [ ] Form validation requires both if provided

- [ ] **Tags Multi-Select**
  - [ ] Shows predefined tags from database
  - [ ] Limits selection to 4 tags maximum
  - [ ] Visual tag chips with remove functionality
  - [ ] Dropdown closes when clicking outside

- [ ] **Login Gate**
  - [ ] Clicking "Search" when logged out shows login modal
  - [ ] Modal has "Login" and "Sign up as Traveler" buttons
  - [ ] Modal routes correctly to `/login` and `/traveler`

### Search Flow (Logged In - /explore)
- [ ] **Search Submission**
  - [ ] Form validation works for all fields
  - [ ] Successful search saves to `public.searches` table
  - [ ] Search data includes: user_id, parsed location, dates, tags
  - [ ] Navigation to `/connect-with-locals` with query params

- [ ] **Results Page (/connect-with-locals)**
  - [ ] Displays search summary with formatted data
  - [ ] Shows search ID confirmation
  - [ ] "New Search" button returns to `/explore`
  - [ ] "Back to Home" button navigates correctly

## 👤 Local Role Management

### Become a Local Flow
- [ ] **Access Control**
  - [ ] "Become a Local" button only shows when `is_local=false`
  - [ ] Page redirects existing locals to `/requests`
  - [ ] Requires authentication (protected route)

- [ ] **Form Functionality (/become-a-local)**
  - [ ] Location fields: city (required), state (optional), country (required, defaults USA)
  - [ ] Bio field: 50-500 characters with live counter
  - [ ] Tags selection: 1-4 tags required with visual management
  - [ ] Form validation prevents submission with invalid data

- [ ] **Database Updates**
  - [ ] Updates `profiles.is_local = true`
  - [ ] Creates record in `public.locals` table
  - [ ] Syncs `local_tags` table with selected tags
  - [ ] Redirects to `/requests` on success

- [ ] **Header State Change**
  - [ ] Button changes from "Become a Local" to "My Traveler Profile"
  - [ ] Profile dropdown adds "My Local Profile" option

### Local Profile Management
- [ ] **Edit Local Profile**
  - [ ] "Edit Local Profile" button visible on `/requests` page
  - [ ] Modal opens with current profile data pre-populated
  - [ ] All form fields editable (location, bio, tags)
  - [ ] Same validation as creation flow
  - [ ] Updates both `locals` and `local_tags` tables
  - [ ] Modal closes on successful save

## 🔒 Security & RLS Testing

### Row Level Security (RLS) Tests
- [ ] **Profile Access**
  - [ ] Users can only read/update their own profile
  - [ ] Cannot access other users' profile data via API

- [ ] **Local Profile Access**
  - [ ] Can only create/update local profile for own user_id
  - [ ] Cannot edit another user's local profile
  - [ ] Can read all local profiles (for search results)

- [ ] **Search Logging**
  - [ ] Searches only logged with user's own user_id
  - [ ] Cannot view other users' search history

- [ ] **Feedback Submission**
  - [ ] Anonymous users can submit feedback
  - [ ] Authenticated users can submit feedback
  - [ ] Cannot read other feedback submissions

### Authentication Edge Cases
- [ ] **Session Management**
  - [ ] Expired sessions redirect to login
  - [ ] Invalid tokens handled gracefully
  - [ ] Page refreshes maintain authentication state

- [ ] **Route Protection**
  - [ ] `/become-a-local` requires authentication
  - [ ] `/explore` requires authentication
  - [ ] `/requests` requires authentication and local role
  - [ ] `/connect-with-locals` requires authentication

## 🌐 Cross-Browser & Responsive Testing

### Browser Compatibility
- [ ] **Chrome/Chromium**
  - [ ] All functionality works
  - [ ] Copy-to-clipboard works
  - [ ] Date inputs display correctly

- [ ] **Firefox**
  - [ ] All functionality works
  - [ ] Form validation displays correctly
  - [ ] Modal overlays work properly

- [ ] **Safari** (if available)
  - [ ] All functionality works
  - [ ] iOS Safari touch interactions

### Responsive Design
- [ ] **Mobile (320px-768px)**
  - [ ] Navigation hamburger works (if implemented)
  - [ ] Forms are easily fillable
  - [ ] Modals fit screen properly
  - [ ] Cards stack correctly

- [ ] **Tablet (768px-1024px)**
  - [ ] Layout transitions smoothly
  - [ ] Search form usable
  - [ ] Profile forms accessible

- [ ] **Desktop (1024px+)**
  - [ ] Full layout displays correctly
  - [ ] Hover states work
  - [ ] Dropdown positioning correct

## ⚡ Performance & Error Handling

### Performance Tests
- [ ] **Page Load Times**
  - [ ] Initial page loads under 3 seconds
  - [ ] Navigation between pages is smooth
  - [ ] Search autocomplete is responsive

- [ ] **Database Operations**
  - [ ] Form submissions complete in reasonable time
  - [ ] Search logging doesn't block user experience
  - [ ] Profile updates are immediate

### Error Handling
- [ ] **Network Issues**
  - [ ] Graceful handling of connection errors
  - [ ] User-friendly error messages
  - [ ] Retry mechanisms where appropriate

- [ ] **Form Validation**
  - [ ] Client-side validation prevents bad submissions
  - [ ] Server-side validation catches edge cases
  - [ ] Clear error messaging for users

- [ ] **Authentication Errors**
  - [ ] Invalid credentials show helpful message
  - [ ] Expired sessions handled gracefully
  - [ ] Password reset errors are clear

## 🚀 Deployment Readiness

### Environment Configuration
- [ ] **Environment Variables**
  - [ ] Supabase URL and keys configured
  - [ ] No sensitive data in client code
  - [ ] Proper environment separation

- [ ] **Build Process**
  - [ ] `npm run build` completes successfully
  - [ ] No TypeScript errors
  - [ ] No console errors in production
  - [ ] All pages pre-render correctly

### Database Schema
- [ ] **Tables Created**
  - [ ] All tables exist with correct schema
  - [ ] RLS policies are active and correct
  - [ ] Indexes for performance where needed

- [ ] **Sample Data**
  - [ ] Tags table populated with predefined tags
  - [ ] Test users can be created
  - [ ] All table relationships work

## ✅ Critical Path Testing

### End-to-End User Journeys
1. **New Traveler Journey**
   - [ ] Visit `/home` → Click search → See login modal
   - [ ] Click "Sign up as Traveler" → Complete signup → Confirm email
   - [ ] Login → Go to `/explore` → Submit search → See results

2. **Become Local Journey**
   - [ ] Login as traveler → Click "Become a Local" → Fill form
   - [ ] Submit → Redirected to `/requests` → See "Edit Local Profile"
   - [ ] Click edit → Modify profile → Save successfully

3. **Feedback Journey**
   - [ ] Visit `/feedback` (logged out) → Fill form → Submit
   - [ ] See success modal → Click "Back to Home"

### Data Integrity
- [ ] **Profile Creation**
  - [ ] New users get correct default values
  - [ ] Role flags set correctly
  - [ ] Profile data persists correctly

- [ ] **Local Profile Management**
  - [ ] Becoming local updates all necessary tables
  - [ ] Tag associations sync correctly
  - [ ] Profile edits preserve data integrity

---

## 🎯 Gate B Success Criteria

For Gate B to be considered successful, all checkboxes above should be completed with:
- ✅ All authentication flows working
- ✅ All static pages functional
- ✅ Search functionality complete with logging
- ✅ Local role creation and editing working
- ✅ RLS security verified
- ✅ Responsive design confirmed
- ✅ No critical bugs or security issues

**Test Environment:** Both development (`npm run dev`) and production build (`npm run build && npm run start`)

**Testing Tools:** Manual testing in multiple browsers, database inspection for data integrity

**Security Focus:** Verify RLS prevents unauthorized access to user data and profiles