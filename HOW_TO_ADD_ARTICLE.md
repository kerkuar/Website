# How to add a new article

You no longer need to ask Claude to update the website for new pieces. Adding an article is **two steps**: write the body in Markdown, then add a metadata entry to the JSON index.

---

## Step 1 — Write the article body

Create a new file in the `articles/` folder. Filename must match the **slug** you'll use (lowercase, words separated by hyphens, no spaces, no special characters):

```
articles/your-article-slug.md
```

**Example**: for an article called *"Why Brussels Lobbying Needs an Audit"*, the slug would be `brussels-lobbying-audit` and the file would be `articles/brussels-lobbying-audit.md`.

Write the article in **Markdown**. The basics:

```markdown
This is a paragraph. Just write normally.

This is a second paragraph. Empty line above creates the break.

## This is a section heading

You can use **bold**, *italic*, [links](https://example.com),
and > block quotes.

- Bullet
- Lists
- Like this

1. Numbered
2. Lists
3. Like this
```

A few tips:

- Don't add a `# Title` at the top — the title comes from the JSON, not the body.
- Use `##` for section headings inside the article.
- For images, drop the file in a folder (e.g. `articles/images/`) and reference with `![alt text](images/filename.jpg)`.
- If copying from Word, paste into a plain Markdown editor (or TextEdit / Notepad) first to strip Word formatting. Then add Markdown syntax for headings, bold, etc.

---

## Step 2 — Add an entry to `articles/articles.json`

Open `articles/articles.json` and add a new object to the array. Use this template:

```json
{
  "slug": "your-article-slug",
  "title": "Your Article Title",
  "subtitle": "An optional one-line subtitle",
  "date": "2026-05-15",
  "tags": ["eu-politics", "economy"],
  "summary": "1-2 sentences for the listing card. Keep it punchy.",
  "emoji": "🛢️",
  "color": "lav",
  "reading_time": "9 min",
  "external_url": "",
  "hero_image": "articles/images/your-article-slug.jpg",
  "hero_caption": "Optional caption shown under the hero image."
}
```

### Field reference

| Field | What it does |
|---|---|
| `slug` | **Must match** the `.md` filename (without `.md`). This is also the URL of the article. |
| `title` | Headline shown on the article page and the card. |
| `subtitle` | Optional. Italic line under the title on the article page. Empty string `""` to hide. |
| `date` | ISO format: `YYYY-MM-DD`. Used to sort newest first. |
| `tags` | Array. Use slugs (lowercase, hyphens). The filter buttons on the Writing page are generated automatically from whatever tags you use. Common ones: `eu-politics`, `human-rights`, `democracy`, `community`, `economy`. Add new ones freely — they appear as filters automatically. |
| `summary` | The blurb on the listing card. ~1–2 sentences. |
| `emoji` | The emoji shown in the card thumbnail. |
| `color` | Card thumbnail background. Options: `lav` (lavender), `mint` (green), `peach` (warm), `gold` (yellow), `sky` (blue). |
| `reading_time` | Optional, e.g. `"7 min"`. Empty string `""` to hide. |
| `external_url` | Optional. **If set**, clicking the card opens this URL (Substack, etc.) instead of `article.html`. Leave as `""` to host the article on your site. |
| `hero_image` | Optional. Path to a hero image, relative to the site root. Convention: drop the file in `articles/images/` named after the slug (e.g. `articles/images/your-article-slug.jpg`). Shown under the title on the article page. |
| `hero_caption` | Optional. Italic caption under the hero image. Useful for crediting historical photos, sources, or giving context (e.g. "Signing ceremony of the Treaty of Rome at the Palazzo dei Conservatori, Rome."). |

### Example: full entry with comma between articles

```json
[
  {
    "slug": "suez-without-sequel",
    "title": "A Suez Without a Sequel",
    "subtitle": "Europe at Hormuz, and the missing treaty",
    "date": "2026-04-30",
    "tags": ["eu-politics", "economy"],
    "summary": "Spain, Italy and France refused America its bases…",
    "emoji": "🛢️",
    "color": "lav",
    "reading_time": "9 min",
    "external_url": ""
  },
  {
    "slug": "brussels-lobbying-audit",
    "title": "Why Brussels Lobbying Needs an Audit",
    "subtitle": "",
    "date": "2026-05-15",
    "tags": ["eu-politics", "democracy"],
    "summary": "The transparency register is voluntary, partial, and quietly broken. Here's what to do.",
    "emoji": "🔍",
    "color": "mint",
    "reading_time": "6 min",
    "external_url": ""
  }
]
```

**Watch out for these JSON gotchas**:
- Every entry except the **last** needs a comma after the `}`.
- Strings need double quotes `"like this"`, not single.
- Tags are an array: `["tag-one", "tag-two"]`.

If unsure, paste the file into [jsonlint.com](https://jsonlint.com) — it will flag any errors.

---

## Step 3 — Commit & push to GitHub

```bash
git add articles/your-article-slug.md articles/articles.json
git commit -m "Add article: your article title"
git push
```

GitHub Pages will rebuild within a minute or two. Your article will appear:

- As a card on the **homepage** (latest 3 articles only) and the **Writing** page (all of them, with filters).
- On its own URL: `https://andishehu.eu/article.html?slug=your-article-slug`.

---

## Hosting on Substack instead

If you'd rather link out to Substack (no internal page on andishehu.eu), set `external_url` to the Substack URL and skip step 1 (no `.md` file needed). The card will still show up in the listing — but clicking it opens Substack in a new tab.

---

## Quick checklist

- [ ] Body file at `articles/<slug>.md`
- [ ] Filename matches the `slug` field exactly
- [ ] Hero image (optional) saved at `articles/images/<slug>.jpg`
- [ ] New entry added to `articles/articles.json`
- [ ] Comma between entries (except the last)
- [ ] Date in `YYYY-MM-DD` format
- [ ] JSON validated (no missing brackets, quotes, or commas)
- [ ] Committed and pushed
