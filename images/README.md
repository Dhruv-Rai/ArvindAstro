# Images — Arvind Rai Website

## Puja Images (Very Easy Guide)

For Puja category and Puja detail image naming/path, use this guide:

public/images/services/README.md

Place the following image files in this `images/` folder.  
All images should be optimised for web (use TinyPNG or Squoosh before uploading).

## Hero Image Update (Layered Component)

Homepage right hero now uses layered files from:

- /public/images/home/home-hero-chakra-bg.png
- /public/images/home/home-hero-subject-foreground.png

Service detail page heroes now use per-service slug files in:

- /public/images/services/[slug]-chakra.png
- /public/images/services/[slug]-person.png

Service detail highlights now use per-service slug files in:

- /public/images/services/[slug]-highlight-1.jpg
- /public/images/services/[slug]-highlight-2.jpg
- /public/images/services/[slug]-highlight-3.jpg

See /public/images/services/README.md for slug naming rules.

---

## Required Images

| # | Filename | Location | Recommended Size | Notes |
|---|----------|----------|-----------------|-------|
| 1 | `arvind-hero.jpg` | Hero section (right panel) | 600 × 800 px | Portrait photo of Arvind Rai, professional quality, solid/gradient background |
| 2 | `arvind-about.jpg` | About section (left column) | 600 × 800 px | Professional portrait or candid photo of Guruji during consultation |
| 3 | `gallery-1.jpg` | Gallery — TV Appearance | 800 × 400 px (wide) | TV appearance or media event photo |
| 4 | `gallery-2.jpg` | Gallery — Consultation Session | 400 × 400 px | Photo from a consultation session |
| 5 | `gallery-3.jpg` | Gallery — Award Ceremony | 400 × 400 px | Award or recognition event photo |
| 6 | `gallery-4.jpg` | Gallery — Podcast Recording | 400 × 400 px | Podcast recording or studio photo |
| 7 | `gallery-5.jpg` | Gallery — Workshop | 800 × 400 px (wide) | Workshop or seminar photo |
| 8 | `gallery-6.jpg` | Gallery — YouTube Studio | 400 × 400 px | YouTube studio or video recording setup |
| 9 | `blog-featured.jpg` | Blog — Featured article | 800 × 500 px | Mercury retrograde or astrology-themed stock image |
| 10 | `blog-moon.jpg` | Blog — Moon article | 400 × 250 px | Full moon or lunar-themed image |
| 11 | `blog-saturn.jpg` | Blog — Saturn article | 400 × 250 px | Saturn or Shani-themed image |
| 12 | `yt-thumb-main.jpg` | YouTube — Featured video | 800 × 500 px | Thumbnail for 2026 yearly horoscope video |
| 13 | `yt-thumb-2.jpg` | YouTube — Video 2 | 400 × 225 px | Thumbnail for Mercury retrograde video |
| 14 | `yt-thumb-3.jpg` | YouTube — Video 3 | 400 × 225 px | Thumbnail for Shani Mahadasha video |
| 15 | `yt-thumb-4.jpg` | YouTube — Video 4 | 400 × 225 px | Thumbnail for daily horoscope video |
| 16 | `yt-thumb-5.jpg` | YouTube — Video 5 | 400 × 225 px | Thumbnail for Vastu tips video |
| 17 | `og-image.jpg` | Social sharing (meta tag) | 1200 × 630 px | Open Graph image for social media previews |

---

## Image Format Guidelines

- **Format:** JPEG for photos, PNG for graphics with transparency
- **Quality:** 80–85% JPEG quality (good balance of size vs quality)
- **Max file size:** Keep each image under 200 KB after compression
- **Tools:** Use [TinyPNG](https://tinypng.com) or [Squoosh](https://squoosh.app) to compress

---

## How to Add Images

1. Place the image file in this `images/` folder  
2. The HTML already has `<img>` tags with `src="images/filename.jpg"` — the images will load automatically  
3. Each image slot has an HTML comment `<!-- IMAGE: ... -->` explaining what goes there
<iframe width="560" height="315" src="https://www.youtube.com/embed/qEh7DQVJBIs?si=-rTRKQYmOQUAtUij" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>