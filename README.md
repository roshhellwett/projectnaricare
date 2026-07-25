# PROJECT NARICARE
Project NariCare is a private, AI-powered health companion designed for women. It provides personalized health assessments, cycle tracking, symptom logging, and an empathetic AI chat companion — all without requiring sign-up or sending data to a server.

## Features
* **Health Assessment** — 18 clinically-informed questions across 5 signals: irregularity, PCOS, pain, anaemia, and stress
* **Cycle Tracker** — Log flow, pain, and mood; visualize patterns and predict next cycles
* **AI Companion (Nari)** — Context-aware chat that reads your history and answers with warmth, not jargon
* **Doctor Companion** — Personalized test and question checklist for your gynaecologist visit
* **History** — Every past check-in in one place, so you can spot how your signals shift over time
* **Privacy-First** — No accounts, no cloud upload; all data stays in your browser

## Installation
1. Clone the repository to your local machine.
2. Navigate to the project directory in your terminal or command prompt.
3. Run the command `npm install` to install the required dependencies.
4. Create a copy of the `.env.example` file and rename it to `.env` (if applicable).
5. Configure the environment variables in the `.env` file as needed.

## Usage
To start the development server, run `npm run dev`. The application will be available at `http://localhost:8080`.

To run automated tests:
* `npm run test:e2e` — End-to-End tests
* `npm run test:smoke` — Smoke tests

## Deploy on Vercel
1. Push this repo to GitHub / GitLab / Bitbucket.
2. Import it in the [Vercel dashboard](https://vercel.com/new). Framework preset: **Other** — Vercel auto-detects `npm run build` and `.vercel/output/`.
3. Add environment variable `GROQ_API_KEY` (Settings → Environment Variables) so "Ask Nari" chat works. Get a free key at [console.groq.com](https://console.groq.com).
4. Deploy. Every push builds and ships automatically.

## Tech Stack
| Technology | Description |
| --- | --- |
| TypeScript | Programming language |
| React | Frontend UI library |
| TanStack Start | Full-stack React framework |
| Vite | Build tooling |
| Tailwind CSS | Utility-first CSS framework |
| Framer Motion | Animation library |
| Radix UI | Accessible component primitives |
| AI SDK | AI model integration |
| Playwright | E2E and smoke testing |

## Contributing
Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file for details on how to contribute to this project.
