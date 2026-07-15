# Phase 2: Google reCAPTCHA Integration

## Implementation Plan

This plan outlines the steps to integrate Google reCAPTCHA into the existing contact form to prevent spam submissions. The implementation involves both frontend widget rendering and backend token verification.

### Proposed Changes

We implemented **reCAPTCHA v3**.

#### Dependencies
- Installed `react-google-recaptcha-v3`.
- Installed `@types/react-google-recaptcha`.

---

#### Environment Variables

**[MODIFY] .env**
Added the Google reCAPTCHA API keys:
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here`
- `RECAPTCHA_SECRET_KEY=your_secret_key_here`

---

#### Frontend

**[MODIFY] src/app/contact/page.tsx**
- Imported the reCAPTCHA component.
- Added a state variable to hold the reCAPTCHA token.
- Rendered the `<ReCAPTCHA />` component inside the contact form.
- Prevented form submission if the reCAPTCHA token is not set.
- Passed the token along with the form data to the backend API.

---

#### Backend API

**[MODIFY] src/app/api/contact/route.ts**
- Extracted the reCAPTCHA token from the incoming request body.
- Sent a verification request to Google's reCAPTCHA verification endpoint (`https://www.google.com/recaptcha/api/siteverify`).
- Checked if the response from Google is successful before proceeding to send the email via Nodemailer.
- Returned appropriate error messages if verification fails.

## Verification Plan

### Automated Tests
None specifically for this integration, but we ensured the Next.js build passes.

### Manual Verification
1. Attempt to submit the form without completing the reCAPTCHA (should fail).
2. Complete the reCAPTCHA and submit the form (should succeed).
3. Verify that an email is successfully received upon successful verification.

---

## Walkthrough: Google reCAPTCHA v3 Implementation

We have successfully integrated Google reCAPTCHA v3 into your contact form to significantly reduce spam submissions without interrupting your users' experience.

### What was changed

1. **Dependency Added**: Installed `react-google-recaptcha-v3` to handle the frontend interactions.
2. **Provider Component**: Created `RecaptchaProvider.tsx` and added it to your contact page layout (`src/app/contact/layout.tsx`). This allows the reCAPTCHA v3 script to load securely on the contact page.
3. **Frontend Integration**: Updated `src/app/contact/page.tsx` to utilize `useGoogleReCaptcha()`. When a user submits the form, a background token is requested from Google, and it's sent along with the form data.
4. **Backend Verification**: Updated the API route (`src/app/api/contact/route.ts`) to intercept the token and verify it against Google's servers (`https://www.google.com/recaptcha/api/siteverify`). The email is only sent if the verification returns `success: true` and the bot score is sufficiently high (>= 0.5).

> [!NOTE]
> The environment variables `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY` were already properly configured in your `.env` file, so no changes were required there!

### Validation

- **No UX friction**: The v3 reCAPTCHA runs entirely in the background, meaning legitimate users will not have to complete image puzzles or check "I'm not a robot".
- **Bot Rejection**: Automated scripts failing to provide a valid token or scoring below `0.5` will now receive a `400 Bad Request` from your API, preventing spam emails.

You can verify the changes by testing a contact form submission on your local development server or after deploying to production.
