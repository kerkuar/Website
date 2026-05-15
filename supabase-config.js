/* ============================================================
   SUPABASE CONFIG — edit these two values when you've set up your project
   ============================================================
   See SUPABASE_SETUP.md in the repo root for the five-minute setup guide.

   The anon key is SAFE to put here — it's designed to be public.
   Real protection comes from Row-Level Security (RLS) policies you set
   up in the SQL editor (the setup guide includes the SQL).

   Until you fill these in with real values, the feedback wall on
   services.html will show a curated set of seed testimonials and the
   submission form will be disabled with a friendly note.
*/
window.SUPABASE_CONFIG = {
    url:     'YOUR_SUPABASE_URL_HERE',    // e.g. https://abcxyz123.supabase.co
    anonKey: 'YOUR_SUPABASE_ANON_KEY_HERE' // long string starting with eyJ…
};

/* Seed testimonials shown when Supabase isn't configured yet, and as a
   fallback if the live fetch fails. Pure HTML-safe strings — keep them
   short. Andi can hand-edit this list anytime.
*/
window.FEEDBACK_SEEDS = [
    {
        body: "Workshop changed how my team talks about our campaign. We stopped pitching our cause and started recruiting people into it — that distinction alone was worth the afternoon.",
        name: "Giulia M.",
        role_org: "Campaigns Lead, civic-tech NGO",
        workshop: "Community organising · Rome · 2025",
        featured: true
    },
    {
        body: "Andi is rare — a policy person who can actually read a room. He took six different organisations and made us draft a coalition memo in three hours that I would have estimated needing three weeks.",
        name: "Tommaso R.",
        role_org: "Coordinator, migrant-rights coalition",
        workshop: "Coalition strategy · Milan · 2025",
        featured: true
    },
    {
        body: "I came in expecting a lecture on advocacy theory and got a working session on the actual file my team is fighting. Practical, demanding, useful.",
        name: "Anna K.",
        role_org: "PhD researcher",
        workshop: "Reading EU legislation · LUISS · 2026"
    },
    {
        body: "Sceptical at first — the field is full of consultants who recycle slides from 2014. Andi clearly does the reading. The Q&amp;A went forty minutes over and nobody left.",
        name: "Marco D.",
        role_org: "Programme officer, foundation",
        workshop: "Strategic litigation as advocacy · 2025"
    }
];
