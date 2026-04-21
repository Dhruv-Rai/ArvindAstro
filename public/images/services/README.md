# Easy Puja Image Guide

Use this file when adding images for Puja pages.

## 1) Exact Folder Path

Put all files in this folder:

public/images/services/

Absolute path on your system:

C:/Users/91945/OneDrive/Desktop/arvindrai/public/images/services/

## 2) Important: Use Slug, Not Title

Image filenames must use slug.

Do not use display title like:

Lakshmi Kuber Pujan

Use slug from URL like:

lakshmi-kuber-pujan

## 3) Puja Category Pages (8 subset pages)

These pages are:

/services/puja/<category-slug>

For each category slug, add:

<category-slug>-chakra.png
<category-slug>-person.png
<category-slug>-highlight-1.jpg
<category-slug>-highlight-2.jpg
<category-slug>-highlight-3.jpg

Category slugs:

- planetary
- wealth-career
- health
- prosperity
- love
- education
- special
- legal

Example for Wealth & Career page:

wealth-career-chakra.png
wealth-career-person.png
wealth-career-highlight-1.jpg
wealth-career-highlight-2.jpg
wealth-career-highlight-3.jpg

## 4) Individual Puja Detail Pages

These pages are:

/service?slug=<puja-slug>

Current behavior:

- Service Highlights are hidden on individual puja detail pages.
- So, you do not need highlight images for each puja item right now.

Optional (if you want hero image on detail page):

<puja-slug>-chakra.png
<puja-slug>-person.png

Example:

lakshmi-kuber-pujan-chakra.png
lakshmi-kuber-pujan-person.png

## 5) If You Cannot Find Slug

Best way:

- Open page in browser.
- Copy slug from URL.

If only title is available, convert to slug:

- lowercase
- spaces/special chars -> hyphen
- remove extra hyphens at start/end

Example:

Year Prediction Report -> year-prediction-report

## 6) Supported Extensions

You can use:

- png
- webp
- jpg
- jpeg

## 7) Missing Image Behavior

If file is missing, UI falls back automatically to default/fallback visual.
