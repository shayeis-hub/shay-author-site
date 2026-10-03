# Shay Eisenberg — author website

A mostly static Next.js site prepared for Vercel. All public copy is in English.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. To verify a production build, run `npm run build` then `npm run start`.

## Deploy a preview on Vercel

1. Put this directory in a new GitHub repository, or run `npx vercel` from this directory with your Vercel account signed in.
2. Import the repository into Vercel. Its Next.js preset works without extra settings.
3. Review the generated `.vercel.app` preview URL. Keep `shayeisenberg.com` disconnected until you approve the design.

## Content and assets

- Edit books, descriptions, sales links, and site contact/social links in `src/content/books.ts`.
- Covers are under `public/books/`. The four current covers came from the supplied author's files. Replace them by keeping their filenames or updating the `cover` fields.
- The author portrait is `public/shay-eisenberg.jpg`, sourced from `IMG_2982.jpg` at 1365 × 2048 pixels.
- The exact Amazon product URL is set only for *A Soldier of No Country*. Add verified links for the other titles to their `amazon` fields before promoting the site.
- `site.youtube` points to the supplied channel. `site.authorAmazon` and `site.contactEmail` are unset; those footer links stay hidden until valid destinations are supplied.
- The Ideas page has no fabricated articles, and the newsletter form is withheld until a provider exists.
- Canonical and sitemap URLs use `https://shayeisenberg.com` as requested. Search engines should be kept off an unapproved Vercel preview through Vercel's deployment protection settings rather than a project-wide robots block.

## Routes

`/`, `/books`, `/books/[slug]`, `/about`, `/ideas`, `/sitemap.xml`, `/robots.txt`.
