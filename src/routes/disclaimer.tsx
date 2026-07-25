import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/disclaimer")({
  component: Disclaimer,
});

function Disclaimer() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-accent-gold-soft to-accent-rose pb-2">
          A Gentle Reminder
        </h1>
        <p className="mt-3 text-muted-foreground">Medical Disclaimer</p>
      </div>

      <div className="space-y-8 glass-panel p-8 md:p-10 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl text-accent-gold-soft mb-3 flex items-center gap-2">
            <span className="text-xl">🌸</span> We are here to support, not diagnose
          </h2>
          <p className="text-muted-foreground">
            Think of NariCare as your wise older sister. The information, scores, and AI conversations 
            provided here are meant to guide you, comfort you, and help you understand your body better. 
            However, this space is <strong>not a substitute for professional medical advice, diagnosis, or treatment.</strong>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-accent-gold-soft mb-3 flex items-center gap-2">
            <span className="text-xl">🩺</span> Always trust your doctor
          </h2>
          <p className="text-muted-foreground">
            You know your body best. If something feels off, or if you have specific questions about a medical 
            condition or treatment, please seek the advice of your physician or a qualified healthcare provider. 
            Never delay seeking professional medical advice because of something you read here.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-accent-gold-soft mb-3 flex items-center gap-2">
            <span className="text-xl">✨</span> Nari is AI, not a doctor
          </h2>
          <p className="text-muted-foreground">
            While Nari is trained to be empathetic and provide helpful information, she is an automated AI. 
            She cannot prescribe medications, run tests, or replace the care of a human healthcare provider. 
            Use her as a companion to help you prepare for your doctor visits!
          </p>
        </section>
        
        <section className="bg-destructive/10 border border-destructive/20 rounded-xl p-5 mt-4">
          <h2 className="font-serif text-xl text-destructive mb-2">In case of emergency</h2>
          <p className="text-muted-foreground text-sm">
            If you are experiencing a medical emergency, severe pain, or heavy uncontrolled bleeding, 
            please go to the nearest hospital or contact emergency services immediately.
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
