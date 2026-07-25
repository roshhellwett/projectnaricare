# Project Structure

A quick map of the codebase so humans and AI agents can find and add things
in the right place.

```
projectnaricare/
├── public/                    # Static files served at a fixed URL
│   ├── og-image.png           #   → https://site/og-image.png
│   └── social-banner.png
│
├── src/
│   ├── assets/                # Local media committed with the project
│   │   ├── flower.png
│   │   ├── logo.png
│   │   └── README.md
│   │
│   ├── components/            # React components, grouped by domain
│   │   ├── chat/              #   Ask Nari chat surface
│   │   ├── home/              #   Home-page widgets
│   │   ├── layout/            #   Site header, footer, chrome
│   │   ├── visuals/           #   Hero flower, animated background, risk bloom
│   │   └── ui/                #   shadcn/ui primitives (button, card, ...)
│   │
│   ├── hooks/                 # Reusable React hooks
│   │
│   ├── lib/                   # Framework-agnostic logic
│   │   ├── errors/            #   SSR error capture + fallback HTML page
│   │   ├── health/            #   Risk scoring + AI system prompt
│   │   ├── storage.ts         #   Typed localStorage wrappers
│   │   └── utils.ts           #   cn() and small helpers
│   │
│   ├── routes/                # TanStack Start file-based routes (FLAT)
│   │   ├── __root.tsx         #   Root shell — html/head/body, providers
│   │   ├── index.tsx          #   /
│   │   ├── assessment.tsx     #   /assessment
│   │   ├── tracker.tsx        #   /tracker
│   │   ├── doctor.tsx         #   /doctor
│   │   ├── history.tsx        #   /history
│   │   ├── ask.index.tsx      #   /ask
│   │   ├── ask.$threadId.tsx  #   /ask/:threadId
│   │   └── api/
│   │       └── chat.ts        #   POST /api/chat (Groq streaming)
│   │
│   ├── router.tsx             # QueryClient + createRouter
│   ├── server.ts              # SSR entry with error normalization
│   ├── start.ts               # Request middleware
│   ├── styles.css             # Tailwind v4 + design tokens (plum/rose/gold)
│   └── routeTree.gen.ts       # AUTO-GENERATED — do not edit
│
├── tests/                     # Playwright e2e + smoke tests
├── vite.config.ts             # Vite + TanStack + Nitro (vercel / cloudflare)
├── vercel.json                # Vercel build hook
└── package.json
```

## Rules of thumb

- **Project images** live locally in `src/assets/` when imported by React, or
  `public/` when they need a fixed URL. Do not use `.asset.json` pointers.
- **Routes** use flat dot-separated filenames (`ask.$threadId.tsx`), not
  nested folders. Path in `createFileRoute("...")` must match the filename.
- **Components** go under `components/<domain>/`. Don't dump one-off UI
  into `components/ui/` — that folder is reserved for shadcn primitives.
- **Business logic** (scoring, storage, prompts) goes in `src/lib/`, never
  inside a component file.
- **Server-only code** either lives in a route under `routes/api/` or in a
  `*.server.ts` / route handler; browser code never imports it directly.
- **Design tokens** live in `src/styles.css`. Never hardcode
  `bg-[#c65b7c]` — use the semantic Tailwind class (`bg-primary`,
  `text-accent-gold-soft`, etc.).

## Environment variables

| Name             | Where     | Purpose                           |
| ---------------- | --------- | --------------------------------- |
| `GROQ_API_KEY`   | Server    | Powers the Ask Nari chat via Groq |

Set locally in `.env`, on Vercel under **Settings → Environment Variables**.
