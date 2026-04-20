# Image Assets Guide

Replace each placeholder file with the real image. Keep the same filename and format.

---

## Root (public/)

| File | Size | Used for |
|------|------|----------|
| `logo.png` | 400×400 px, transparent bg | JSON-LD schema, og tags |
| `favicon.ico` | 32×32 px | Browser tab icon |
| `apple-touch-icon.png` | 180×180 px | iOS home screen icon |
| `icon-192.png` | 192×192 px | Android PWA icon |
| `icon-512.png` | 512×512 px | Android PWA splash |
| `og-image.jpg` | 1200×630 px | Social media preview card |

---

## images/team/

| File | Size | Used for |
|------|------|----------|
| `team-photo.jpg` | 1200×800 px | About section background |
| `mascot.png` | 800×800 px, transparent bg | Hero section right side |

---

## images/gallery/

Five photos shown in the asymmetric grid on the homepage.
Upload real photos here, then reference them in Sanity Studio under **Site Settings → Gallery**.

| File | Recommended size |
|------|-----------------|
| `gallery-1.jpg` | 1200×1200 px (large left slot) |
| `gallery-2.jpg` | 1200×900 px |
| `gallery-3.jpg` | 800×800 px |
| `gallery-4.jpg` | 800×800 px |
| `gallery-5.jpg` | 1600×900 px (wide bottom slot) |

---

## images/sponsors/

Logo images for sponsors. Upload the real logos, then reference them in Sanity Studio under **Sponsors**.

| File | Size | Notes |
|------|------|-------|
| `sponsor-1.png` | 400×200 px, transparent bg | Platinum sponsor |
| `sponsor-2.png` | 400×200 px, transparent bg | Gold sponsor |
| `sponsor-3.png` | 400×200 px, transparent bg | Silver sponsor |

Add more files as needed (sponsor-4.png, etc.)

---

## images/news/ and images/events/

News article and event cover images are managed through **Sanity Studio** — upload them directly there when creating content. The files in these folders are just placeholders.

---

## How to upload to Sanity

1. Open `http://localhost:3000/studio`
2. Go to the relevant document (Site Settings, News Article, Event, Sponsor)
3. Click the image field and upload from your computer
4. Sanity handles resizing and CDN delivery automatically
