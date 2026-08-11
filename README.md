# AiOS SF · Lightning

Lightning demo signup for AiOS Meetup SF, hosted at Convex HQ. Eight slots, two
to three minutes each, working software only.

Next.js 16 App Router, TypeScript, Tailwind v4, Convex for data, Clerk for auth,
deployed on Vercel.

## Routes

| Route    | Access               | What it does                                                              |
| -------- | -------------------- | ------------------------------------------------------------------------- |
| `/`      | Public               | Rules, the dry run gate, and the apply call to action.                     |
| `/apply` | Signed in            | One submission per person. Editable, so typos are fixable.                |
| `/host`  | `HOST_EMAILS` only   | Triage submissions by status. Refuses to select more than 8.              |
| `/board` | Public               | Running order for the room. Selected names and titles only. Updates live. |

## Environment variables

| Name                               | Where it goes                            | Where to find it                                        |
| ---------------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Vercel and `.env.local`                  | Clerk dashboard, API keys                               |
| `CLERK_SECRET_KEY`                 | Vercel and `.env.local`                  | Clerk dashboard, API keys                               |
| `NEXT_PUBLIC_CONVEX_URL`           | Vercel and `.env.local`                  | Written by `npx convex dev`, or the Convex deployment URL |
| `HOST_EMAILS`                      | Vercel, `.env.local`, and Convex         | You choose. Comma separated                             |
| `CLERK_JWT_ISSUER_DOMAIN`          | Convex only                              | Clerk Frontend API URL                                  |

`HOST_EMAILS` is read in two runtimes on purpose. Next.js uses it to gate the
`/host` page, Convex uses it to reject host mutations from anyone else. Set it in
both places. `smile@rayfernando.ai` is allowlisted in code as a fallback, so the
host view still works if the variable is never set.

The public keys are inlined at build time, so redeploy after changing them. If
either public key is missing, every page renders a short setup checklist instead
of the app.

## Local setup

```bash
npm install
```

1. Start Convex. This creates the deployment, writes `NEXT_PUBLIC_CONVEX_URL` and
   `CONVEX_DEPLOYMENT` into `.env.local`, and keeps the schema in sync. Leave it
   running.

   ```bash
   npx convex dev
   ```

2. Create a Clerk application, then activate the Convex integration at
   [dashboard.clerk.com/apps/setup/convex](https://dashboard.clerk.com/apps/setup/convex).
   Copy the Frontend API URL. In development it looks like
   `https://verb-noun-00.clerk.accounts.dev`.

3. Give Convex the issuer domain and the host allowlist.

   ```bash
   npx convex env set CLERK_JWT_ISSUER_DOMAIN https://verb-noun-00.clerk.accounts.dev
   npx convex env set HOST_EMAILS "smile@rayfernando.ai"
   ```

4. Copy `.env.example` to `.env.local` and paste the Clerk keys plus
   `HOST_EMAILS`. Keep the Convex lines that `npx convex dev` already wrote.

5. Run the app.

   ```bash
   npm run dev
   ```

## Deploy to Vercel

Import the repo, then set the environment variables above in the Vercel project.

The tidy option is to let Convex deploy alongside the frontend. Create a
production deploy key in the Convex dashboard, set it as `CONVEX_DEPLOY_KEY` in
Vercel, and use this build command:

```bash
npx convex deploy --cmd 'npm run build'
```

That pushes the Convex functions and passes the right `NEXT_PUBLIC_CONVEX_URL`
into the build, so you do not set that one by hand. Set
`CLERK_JWT_ISSUER_DOMAIN` and `HOST_EMAILS` on the production Convex deployment
as well, not just the dev one.

Without a deploy key, keep the default `npm run build` and set
`NEXT_PUBLIC_CONVEX_URL` in Vercel to your Convex deployment URL.

## Host access and the email claim

Host checks run on the email inside the Convex token. Clerk's Convex integration
issues a JWT template named `convex`, and `convex/auth.config.ts` validates it
with `applicationID: "convex"`.

If `/host` shows "Host access only" for an allowlisted address, or submissions
show `no email on token`, open the `convex` JWT template in Clerk and confirm it
includes an email claim:

```json
{ "email": "{{user.primary_email_address}}" }
```

## Data model

`convex/schema.ts` has one table.

`submissions`: `userId`, `email`, `displayName`, `demoTitle`,
`whatYoullShowLive`, `takeaway`, `noSlides`, `noPitch`, `readyIn60s`, `status`,
`createdAt`, `updatedAt`. Indexed `by_user` and `by_status`. Status is one of
`submitted`, `shortlisted`, `selected`, `rejected`.

Rules enforced in `convex/submissions.ts`, not just in the UI:

- One row per user. Applying again edits the existing row.
- All three format confirmations must be checked.
- No more than 8 submissions can sit in `selected`.
- Only allowlisted emails can list submissions or change a status.

## Night of checklist

1. Env vars pasted in Vercel, then redeploy.
2. Sign in and open `/host`. It should list submissions, not deny you.
3. Apply once yourself to smoke test the flow, then set that row to rejected.
4. Point the QR code at the site root.
5. Put `/board` on the projector. It updates itself as you select.

## Scripts

```bash
npm run dev     # Next.js dev server
npm run build   # production build
npm run lint    # eslint
npx convex dev  # Convex functions and schema in watch mode
```
