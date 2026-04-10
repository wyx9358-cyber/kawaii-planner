# Momo Time

A cute, mobile-first shift planning and time management app built with Next.js, TypeScript, Tailwind CSS, Zustand, and lightweight PWA support.

## Included in this project

- Dashboard
- Weekly schedule page
- Monthly calendar page with detail drawer
- Wage and time analytics
- Task check-ins
- Theme and wallpaper settings
- Natural-language shift parser
- CSV + JSON export
- Local persistence
- PWA manifest + service worker

## Tech stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- Lucide React
- Framer Motion

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build for production

```bash
npm run build
npm run start
```

## Deploy

### Vercel
1. Push the project to GitHub.
2. Import the repo into Vercel.
3. Framework preset: Next.js.
4. Deploy.

### Netlify
1. Push the project to GitHub.
2. Import the repo into Netlify.
3. Build command: `npm run build`
4. Publish directory: `.next`
5. The included `netlify.toml` already adds the Next.js plugin.

## Notes

- Data is stored locally in the browser via Zustand persistence.
- Wallpaper currently accepts a remote image URL. You can later replace this with a local upload flow.
- PDF / poster export is not included yet, but the structure is ready for expansion.
