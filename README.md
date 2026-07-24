# ProfilePilot

ProfilePilot is a standalone dating-profile support platform for men. It includes profile building, prompt and bio generation, photo review, image-prompt templates, account-appeal support, consultations, phone authentication, subscriptions and an admin foundation.

## Isolation guarantee

ProfilePilot is completely separate from Predicta. It has its own repository, deployment configuration, database schema, authentication, storage, API credentials, payment configuration and mobile identifiers. No Predicta service or secret is referenced by this project.

## Repository structure

The complete source is stored as a checksum-verified deployment archive under `bootstrap/`. During installation, `scripts/bootstrap-source.cjs` reconstructs and verifies the source before installing the Next.js application in `apps/web`.

The archive contains:

- Next.js web application
- Supabase schema and row-level security policies
- AI profile, prompt, opener, photo-review and image-generation flows
- 96 structured image prompts
- Razorpay subscription routes
- Phone OTP authentication architecture
- Consultation and account-appeal workflows
- Security, deployment and operating documentation

## Deploy a demo on Vercel

1. Import `vikhramiyengar/profilepilot` into a new Vercel project.
2. Keep the project root as `./`.
3. Use the repository's `vercel.json` settings.
4. Add these environment variables:

```env
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_APP_URL=https://YOUR-PROJECT.vercel.app
```

5. Deploy.

The installer verifies the source archive, expands it, installs the web dependencies and runs the production build.

## Enable production services

Create resources dedicated exclusively to ProfilePilot and add:

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

OPENAI_API_KEY=
OPENAI_TEXT_MODEL=gpt-5-mini
OPENAI_VISION_MODEL=gpt-5-mini
OPENAI_IMAGE_MODEL=gpt-image-1

NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_PRO_PLAN_ID=
RAZORPAY_ELITE_PLAN_ID=
RAZORPAY_TOTAL_COUNT=12

ADMIN_PHONE_NUMBERS=
```

Apply the Supabase migrations from `supabase/migrations` after the installer expands the source locally or during deployment.

## Local development

```bash
npm install
npm run dev
```

The first install reconstructs the complete source. Demo mode can then be configured in `.env.local`.

## Account-support boundary

The account-support module helps users organise facts, understand published policies, secure their accounts and prepare truthful appeals. It does not guarantee reinstatement or support enforcement evasion.
