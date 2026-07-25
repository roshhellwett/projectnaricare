import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsOfService,
});

function TermsOfService() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-accent-gold-soft to-accent-rose pb-2">
          House Rules
        </h1>
        <p className="mt-3 text-muted-foreground">Terms of Service</p>
      </div>

      <div className="space-y-8 glass-panel p-8 md:p-10 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl text-accent-gold-soft mb-3 flex items-center gap-2">
            <span className="text-xl">🤝</span> Mutual Respect
          </h2>
          <p className="text-muted-foreground">
            By using NariCare, we ask that you engage with the platform respectfully. 
            We are providing this service as a safe space to help you understand your body, 
            and by using it, you agree to these simple terms of service.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-accent-gold-soft mb-3 flex items-center gap-2">
            <span className="text-xl">🌱</span> The Nature of our Service
          </h2>
          <p className="text-muted-foreground">
            NariCare is provided "as is" to help guide you. Because every body is incredibly unique, 
            we cannot guarantee absolute accuracy in our AI responses or assessment scoring. 
            They are clinical estimates designed to support you, not absolute scientific facts.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-accent-gold-soft mb-3 flex items-center gap-2">
            <span className="text-xl">🎂</span> Age Requirements
          </h2>
          <p className="text-muted-foreground">
            Because this app discusses sensitive reproductive health topics, we ask that you are 
            at least 13 years old to use NariCare. If you are under 18, we strongly encourage you 
            to use the app with the support of a parent, guardian, or trusted older sister!
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-accent-gold-soft mb-3 flex items-center gap-2">
            <span className="text-xl">🛡️</span> Our Liability
          </h2>
          <p className="text-muted-foreground">
            While we've poured our hearts into building NariCare, we (the developers and partners) 
            cannot be held legally liable for any damages, losses, or issues that arise from using 
            this service. Please always prioritize professional medical care for health decisions.
          </p>
        </section>
      </div>

      <div className="mt-12 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-accent-gold-soft hover:text-accent-rose transition-colors duration-300">
          ← Back to your safe space
        </Link>
      </div>
    </div>
  );
}
