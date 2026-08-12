# AiOS SF · Lightning

Signup and live running order for a lightning-demo night. Applicants apply in
about a minute, hosts triage from a phone, and the projector board updates as
slots lock. The copy in this repo is the AiOS Meetup SF night at Convex HQ.
Fork it and run your own.

Next.js 16 App Router, TypeScript, Tailwind v4, Convex for data, Clerk for auth,
deployed on Vercel. MIT licensed.

## Run your own event

1. Fork or clone the repo.
2. Rewrite `lib/content.ts`. Every event-specific string (name of the night,
   venue, dry-run rule, house rules) lives there. To change the slot count,
   edit `MAX_SELECTED` in `convex/lib/limits.ts`.
3. Follow [Local setup](#local-setup) to wire Convex and Clerk, and put your
   own address in `HOST_EMAILS`.
4. Ship it with [Deploy to Vercel](#deploy-to-vercel), then walk the
   [night-of checklist](#night-of-checklist).

## Routes

| Route    | Access               | What it does                                                              |
| -------- | -------------------- | ------------------------------------------------------------------------- |
| `/`      | Public               | Rules, the dry run gate, and the apply call to action.                     |
| `/apply` | Signed in            | One submission per person. Editable, so typos are fixable.                |
| `/host`  | `HOST_EMAILS` only   | Triage submissions by status. Refuses to select more than 8.              |
| `/board` | Public               | Running order for the room: name, demo title, what they will show, and the takeaway. Updates live. |

## Where auth runs

`proxy.ts` runs Clerk's middleware on `/apply` and `/host` only. Clerk bounces a
fresh browser to its own servers before rendering a matched route, so keeping `/`
and `/board` off that list means the landing page and the projector board render
straight away and keep working even when Clerk is slow or down. Nothing depends
on that path matching for access control: both signed in routes check the user
where they read data, and every Convex function checks again on the backend.

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
both places. There is no fallback in code. While the variable is unset, nobody
can open `/host`, and the page tells you which address to add.

The public keys are inlined at build time, so redeploy after changing them. If
either public key is missing, every page renders a short setup checklist instead
of the app.

## Security notes

- No key under version control, ever. Secrets live in `.env.local` (gitignored)
  and in the Vercel and Convex dashboards.
- `CLERK_SECRET_KEY` is the only true secret here. The two `NEXT_PUBLIC_` values
  are inlined into the client bundle by design.
- Clerk Development keys (`pk_test_`, `sk_test_`) are for local work. They run
  with relaxed security and a visible development banner. Before pointing
  attendees at a real URL, create a Clerk Production instance and use its
  `pk_live_` and `sk_live_` keys. See [Deploy to Vercel](#deploy-to-vercel).
- The board is public by design and shows exactly four fields: name, demo
  title, what they will show, and the takeaway. The `board` query in
  `convex/submissions.ts` returns only those fields, so emails and host-only
  data never leave Convex. Keep it that way when you change it.
- `HOST_EMAILS` gates the `/host` page in Next.js and, separately, every host
  function in Convex. The Convex check is the one that protects data.

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
   npx convex env set HOST_EMAILS "you@example.com"
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

For a real event, use a Clerk Production instance, not Development keys. In the
Clerk dashboard, create the Production instance (it needs a domain you own),
put its `pk_live_` and `sk_live_` keys in Vercel, and set
`CLERK_JWT_ISSUER_DOMAIN` on the production Convex deployment to the production
Frontend API URL, which looks like `https://clerk.your-domain.com`.

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
`createdAt`, `updatedAt`, `selectedAt`. Indexed `by_user` and `by_status`.
Status is one of `submitted`, `shortlisted`, `selected`, `rejected`.
`selectedAt` orders the board and is cleared when a row leaves `selected`.

Rules enforced in `convex/submissions.ts`, not just in the UI:

- One row per user. Applying again edits the existing row.
- All three format confirmations must be checked.
- No more than 8 submissions can sit in `selected`.
- Only allowlisted emails can list submissions or change a status.

## Night of checklist

1. Production env vars pasted in Vercel, including live Clerk keys and
   `HOST_EMAILS`, then redeploy.
2. Sign in and open `/host`. If it denies you, the email you signed in with is
   missing from `HOST_EMAILS` in Vercel, on Convex, or both.
3. Apply once yourself to smoke test the flow, then set that row to rejected.
4. Point the QR code at the site root.
5. Put `/board` on the projector. It updates itself as you select.

## Scripts

```bash
npm run dev        # Next.js dev server
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # route types, then tsc
npx convex dev     # Convex functions and schema in watch mode
```

## License

MIT. See [LICENSE](LICENSE).
