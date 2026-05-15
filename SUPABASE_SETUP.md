# Supabase setup — workshop feedback wall

Five-minute, one-time setup. Until you do this, the feedback wall on `services.html` shows seed testimonials and the submission form is disabled with a friendly note.

---

## 1 · Create a Supabase project

1. Go to <https://supabase.com>, sign in with GitHub or email.
2. Click **New project**.
3. Name it (e.g. `andishehu-feedback`), pick a region close to you (Frankfurt is closest to Rome), pick a strong DB password and save it somewhere — you won't need it for the website but you'll need it if you ever want to restore from backup.
4. Wait ~2 minutes for the project to provision.

---

## 2 · Run the schema

In the left sidebar click **SQL Editor → New query**, paste the block below and click **Run**:

```sql
-- Testimonials table
create table public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role_org    text,
  workshop    text,
  body        text not null,
  featured    boolean default false,
  approved    boolean default true,
  created_at  timestamptz default now()
);

-- Enable Row-Level Security
alter table public.testimonials enable row level security;

-- Public can INSERT (but only their own visible columns)
create policy "anon insert"
on public.testimonials for insert
to anon
with check (
  featured = false and approved = true
  and length(name) between 1 and 80
  and length(body) between 5 and 1200
);

-- Public can SELECT only approved entries
create policy "anon read approved"
on public.testimonials for select
to anon
using (approved = true);

-- Authenticated users (you, via magic link) can do everything
create policy "auth all"
on public.testimonials for all
to authenticated
using (true) with check (true);

-- Helpful index
create index testimonials_created_idx on public.testimonials (created_at desc);
```

You should see "Success. No rows returned." and the table appears under **Table Editor**.

---

## 3 · Get your URL + anon key

In the left sidebar: **Project settings → API**.

Copy two values:
- **Project URL** — looks like `https://abcxyz123.supabase.co`
- **anon / public key** — long string starting with `eyJ…`

Open `supabase-config.js` in this repo and paste them in:

```js
window.SUPABASE_CONFIG = {
    url:     'https://abcxyz123.supabase.co',
    anonKey: 'eyJ...'
};
```

Commit, push. The wall is now live and accepting submissions.

The anon key is **safe to commit**. It's designed to be public. The Row-Level Security policies above are what actually protect the data.

---

## 4 · Email when someone submits a note (optional but recommended)

Two paths. Pick whichever is less painful.

### Path A — Database webhook + Make/Zapier (no code)

1. In Supabase: **Database → Webhooks → Create a new webhook**.
2. Name: `New testimonial → email me`
3. Table: `testimonials` · Events: ☑ Insert · Type: HTTP request
4. URL: paste a webhook URL from Make.com or Zapier (free tier is fine), with a scenario that sends you an email containing the row payload.
5. Save.

### Path B — Edge Function + Resend (more elegant)

1. Sign up at <https://resend.com> (3,000 emails/month free). Verify your domain or use their onboarding sandbox.
2. In Supabase: **Edge Functions → Deploy a new function** named `notify-testimonial`. Paste:

   ```ts
   import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

   serve(async (req) => {
     const payload = await req.json();
     const t = payload.record;
     const body = `New workshop feedback on andishehu.eu

From: ${t.name}${t.role_org ? " · " + t.role_org : ""}
Workshop: ${t.workshop || "(not specified)"}
At: ${t.created_at}

---
${t.body}
---

Admin: https://andishehu.eu/admin.html`;

     await fetch("https://api.resend.com/emails", {
       method: "POST",
       headers: {
         "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
         "Content-Type": "application/json"
       },
       body: JSON.stringify({
         from: "Feedback wall <noreply@andishehu.eu>",
         to: "andi.shehu@gmail.com",
         subject: `New workshop note from ${t.name}`,
         text: body
       })
     });
     return new Response("ok");
   });
   ```

3. **Edge Functions → Secrets**: add `RESEND_API_KEY` with the key from your Resend dashboard.
4. **Database → Webhooks**: same as Path A but choose **Supabase Edge Functions** as the destination, pick `notify-testimonial`.

---

## 5 · Sign in to the admin page

The admin page is at `https://andishehu.eu/admin.html`. It's `noindex,nofollow` — search engines ignore it, but anyone who knows the URL can land on the sign-in box.

First time:
1. Go to `admin.html`.
2. Type your email (the one your Supabase account uses).
3. Click **Send magic link**.
4. Check your inbox, click the link. You're in for an hour.

From there you can:
- **★ Feature** an entry (it gets the prominent pull-quote treatment at the top of the wall — max 2 featured at a time displayed).
- **Hide** an entry (soft delete — it stays in the table but stops showing publicly).
- **Delete** an entry permanently.

Closing the tab logs you out.

---

## Troubleshooting

**The form says "Connect Supabase first."** → `supabase-config.js` still has placeholder values. Replace them.

**Submitting gives "Something went wrong."** → The RLS policy may not be in place. Re-run the SQL from step 2.

**Magic link email never arrives.** → In Supabase **Authentication → Email Templates → Magic Link**, check that the template is enabled. By default it uses Supabase's transactional email, which is rate-limited to 3 emails/hour on the free plan. For production, plug in a custom SMTP under **Authentication → Settings**.

**I want to add a "starred / verified attendee" badge.** → Add a column to the table: `alter table testimonials add column verified boolean default false;` and have the admin page set it. Update `feedback-wall.js` to render the badge.
