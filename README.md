# Portfolio

Personal site: a project carousel, scroll-driven case studies and an About page.
Plain JavaScript + Vite, no framework.

## Run it

```sh
npm install
npm run dev        # http://127.0.0.1:5180
```

`npm start` does the same and opens the browser. `npm run build` writes a static site to `dist/`,
and `npm run preview` serves that build locally.

## Edit content

Everything on screen comes from two files:

- `src/data/projects.js`: one object per project (context, pipeline steps, highlights, gallery).
  The field reference is at the top of the file. A project without a `cover` gets its pipeline drawn as a diagram.
- `src/data/profile.js`: About page, contact links, experience, publications.

Images, GIFs and `.webm`/`.mp4` clips go in `public/media/<slug>/`. Reference them as
`media/<slug>/file.ext` (no leading slash). Videos autoplay muted on a loop, and only while visible.

Routes are hash-based (`#/` about, `#/work`, `#/work/<slug>`), so deep links work on GitHub Pages without rewrites.

## Deploy to GitHub Pages

The build uses relative asset paths (`base: './'`), so the same output works at
`https://<user>.github.io/` and at `https://<user>.github.io/<repo>/`.

1. Push this folder to a GitHub repo, on the `main` branch.
   For a personal root site, name the repo `<user>.github.io`.
2. In the repo, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it.

## Layout

```
src/
  main.js            router and theme
  lib.js             media, reveal, count-up, scroll helpers
  diagram.js         SVG pipeline drawn for projects without a screenshot
  ink.js             ink-wash WebGL backdrop and paper texture (one for the whole site)
  pages/             about (landing), home (work carousel + index), project, header
  data/              projects.js, profile.js
  styles/main.css    all styles; tokens are at the top
public/media/        screenshots, GIFs, clips (deployed)
media-spare/         captured but unused images, not deployed
legacy-v1/           the previous version of the site, kept for reference (safe to delete)
```
