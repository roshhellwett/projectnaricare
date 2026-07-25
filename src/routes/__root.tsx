import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import logoUrl from "@/assets/logo.png";
import { AnimatedBackground } from "@/components/visuals/AnimatedBackground";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { BottomNav } from "@/components/layout/BottomNav";
import { FloatingChat } from "@/components/chat/FloatingChat";
import { WelcomeScreen } from "@/components/onboarding/WelcomeScreen";
import { useProfile } from "@/lib/profile";


function NotFoundComponent() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md text-center"
      >
        <h1 className="font-serif text-7xl text-accent-gold-soft">404</h1>
        <h2 className="mt-4 font-serif text-xl">This page slipped through the cycle.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="btn-primary-glow inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            Go home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error("[NariCare Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md text-center"
      >
        <h1 className="font-serif text-2xl text-destructive">Oops!</h1>
        <p className="mt-2 text-base font-medium text-foreground">
          Something went wrong with this response
        </p>
        <div className="mt-4 rounded-xl border border-hairline bg-surface p-4 text-left shadow-inner">
          <p className="text-xs font-mono text-muted-foreground break-words">
            {error.message || "Unknown error occurred"}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-primary-glow inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center rounded-full border border-hairline px-5 py-2.5 text-sm font-semibold text-foreground hover:border-accent-gold-soft hover:text-accent-gold-soft transition-colors"
          >
            Go home
          </a>
        </div>
      </motion.div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#4b2130" },
      {
        title: "NariCare — India's most private, AI-powered women's health companion",
      },
      {
        name: "description",
        content:
          "NariCare is an AI-powered menstrual & reproductive health hub for Indian women. Run a private assessment, track your cycle, and talk to Nari — your private AI 'Didi' and health companion.",
      },
      { name: "author", content: "NariCare" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: logoUrl, type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,450;0,9..144,600;1,9..144,450&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/** Page transition variants — GPU-friendly (opacity + transform only). */
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
} as const;


function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return null; // or a tiny loader
  }

  if (!profile) {
    return <WelcomeScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatedBackground />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#2a1d2a",
            color: "#f6ede8",
            border: "1px solid rgba(246,237,232,0.1)",
          },
        }}
      />
      <div className="flex min-h-[100dvh] flex-col">
        <SiteHeader />
        <main className="flex-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <SiteFooter />
        <BottomNav />
        <FloatingChat />
      </div>

    </QueryClientProvider>
  );
}
