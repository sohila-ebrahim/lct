# LCT Universal — website

Source for [lctuniversal.com](https://lctuniversal.com), the website of LCT Universal Executive Transports (chauffeured transportation across Dallas–Fort Worth; office in Irving, Texas).

## Development

Requires Node.js and npm.

```sh
npm install
npm run dev        # local dev server on http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build
npm test           # unit tests
npm run typecheck
```

## Deployment

Netlify builds and publishes `main` automatically (`netlify.toml`). Netlify Functions live in `netlify/functions/`; secrets such as `GEMINI_API_KEY` are set in the Netlify dashboard, never committed.

## Built with

- Vite, React, TypeScript
- TanStack Router
- Tailwind CSS
- Supabase (lead forms)
- MyLimoBiz (online reservations and client login)
