import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useThreads } from "@/hooks/useThreads";
import { storage } from "@/lib/storage";
import { ChatLockdown } from "@/components/chat/ChatLockdown";
import { ChatSkeleton } from "@/components/ui/page-skeleton";

export const Route = createFileRoute("/ask/")({
  head: () => ({
    meta: [
      { title: "Ask Nari · Your AI health companion" },
      {
        name: "description",
        content:
          "Chat with Nari, an AI trained on women's cycle and reproductive health. Personalized to your NariCare assessment and cycle log.",
      },
      { property: "og:title", content: "Ask Nari · Your AI health companion" },
      { property: "og:description", content: "Chat with an AI that knows your cycle context." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AskIndex,
});

function AskIndex() {
  const { threads, ready, create } = useThreads();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;

    if (storage.getAssessments().length === 0) return;

    if (threads.length > 0) {
      navigate({ to: "/ask/$threadId", params: { threadId: threads[0].id }, replace: true });
    } else {
      const t = create();
      navigate({ to: "/ask/$threadId", params: { threadId: t.id }, replace: true });
    }
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  if (ready && storage.getAssessments().length === 0) {
    return <ChatLockdown />;
  }

  return <ChatSkeleton />;
}
