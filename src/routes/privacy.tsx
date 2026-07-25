import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-accent-gold-soft to-accent-rose pb-2">
          Your Secrets are Safe
        </h1>
        <p className="mt-3 text-muted-foreground">Privacy Policy</p>
      </div>

      <div className="space-y-8 glass-panel p-8 md:p-10 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl text-accent-gold-soft mb-3 flex items-center gap-2">
            <span className="text-xl">🏠</span> Your data stays with you
          </h2>
          <p className="text-muted-foreground">
            We believe your health is deeply personal. That's why NariCare doesn't have any databases 
            or central servers for storing your health records. Everything you type, log, or track 
            stays right here—saved locally on your phone or computer.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-accent-gold-soft mb-3 flex items-center gap-2">
            <span className="text-xl">🤖</span> Chatting with Nari
          </h2>
          <p className="text-muted-foreground">
            When you ask Nari a question, the app securely sends your messages (and your cycle context) 
            to our AI partners solely to generate an answer for you. This data is transmitted securely, 
            is never saved on their end, and is never used to train their models.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-accent-gold-soft mb-3 flex items-center gap-2">
            <span className="text-xl">👻</span> Zero tracking
          </h2>
          <p className="text-muted-foreground">
            You won't find any creepy tracking pixels, advertising cookies, or invasive analytics here. 
            We do not sell, rent, or share your information. Period.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-accent-gold-soft mb-3 flex items-center gap-2">
            <span className="text-xl">🧹</span> You are in control
          </h2>
          <p className="text-muted-foreground">
            Because you hold all your data, you hold all the power. You can completely wipe your 
            history at any time by clicking "Manage Data &gt; Clear all history &amp; data" at the bottom of the page, 
            or by simply clearing your browser's data. 
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
