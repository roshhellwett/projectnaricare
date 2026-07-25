# src/assets

Local images and static binary assets bundled with the app. Imported directly
by Vite so they ship with the repo and sync to GitHub.

```tsx
import logoUrl from "@/assets/logo.png";

<img src={logoUrl} alt="Logo" />
```

Keep files reasonably sized (compress large images before adding).
