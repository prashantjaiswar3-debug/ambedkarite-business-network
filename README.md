# ABN — Ambedkarite Business Network

A bilingual (English / Hindi) B2C + B2B business discovery portal starter built with static HTML/CSS/JavaScript and Supabase.

## Backend already provisioned

- Supabase project: `abn-business-network`
- Project ref: `ztwownezpjrbeowwhaxw`
- Region: `ap-south-1` (Mumbai)
- Database schema: profiles, business_categories, businesses, products_services, business_verification_requests, enquiries, reviews, notifications
- Auth profile trigger, row-level security, admin RPCs and Storage buckets/policies are installed.
- Frontend uses the Supabase publishable key. Never add a Supabase secret/service-role key to browser code.

## Run locally

A static module app should be served over HTTP (not opened as `file://`):

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a new public GitHub repository named `ambedkarite-business-network`.
2. Upload the contents of this folder to the repository root.
3. In GitHub, open **Settings → Pages** and choose **GitHub Actions** as the build/deployment source.
4. The included workflow publishes the root directory on every push to `main`.
5. Add your final site URL to Supabase **Authentication → URL Configuration → Redirect URLs** (for password reset links).

## Authentication setup

In Supabase Dashboard → Authentication → URL Configuration:
- Set Site URL to your GitHub Pages URL after publishing.
- Add the GitHub Pages URL and local development URL to Redirect URLs.

Email/password signup and login are wired. If email confirmation is enabled, users must confirm their email before they can sign in. Configure SMTP before public launch for reliable delivery.

## Admin access

Admin access is based on the trusted JWT `app_metadata.role` claim (not user-editable `user_metadata`).

To grant administrator access to a user after they sign up, use the Supabase Dashboard or a trusted server-side admin process to set:

```json
{ "role": "admin" }
```

in that user's **app_metadata**, then have the user sign out and sign back in to refresh their token.

Do not grant admin using browser-side code or user-editable metadata.

## Important production notes

- The publishable key embedded in `app.js` is designed for browser use. Never expose secret/service-role keys.
- Review Supabase Security Advisor before production launch.
- Configure custom SMTP, CAPTCHA, domain/redirect URLs, privacy policy, terms and support contacts.
- The current build is a functional starter: public listings, signup/login, business submission, customer enquiries, owner listings, verification requests and admin approval RPC are connected. Product/service CRUD, richer admin management, document upload UI, messaging, payments, moderation workflows and production branding are next implementation stages.
- Replace the demo stock images and placeholder support email before launch.
