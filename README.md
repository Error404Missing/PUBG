This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Supabase setup 🔌

This project can integrate with Supabase for Auth, Database, Storage and Realtime features.

1. Create a Supabase project at https://app.supabase.com and go to **Settings → API** to get the following values:

   - `Project URL` → set as `NEXT_PUBLIC_SUPABASE_URL`
   - `anon (public) key` → set as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → set as `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

2. Create a local `.env.local` (this repo ignores `.env*` by default). Example values are in `.env.example`.

3. For Vercel: add the same variables via Project → Settings → Environment Variables and mark `SUPABASE_SERVICE_ROLE_KEY` as a secret (do not expose it publicly).

4. The repository includes a minimal Supabase client in `lib/supabase.ts` that exports a public `supabase` client and a `createSupabaseAdmin()` helper for server-side operations.

   - The registration endpoint (`/api/register`) will also create a Supabase Auth user (server-side) so the application and Supabase Auth remain in sync.

If you want, you can migrate authentication from the current Credentials-based NextAuth flow to Supabase Auth — open an issue or request and I can implement that conversion for you.
