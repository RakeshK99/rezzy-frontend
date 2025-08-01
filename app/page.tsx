import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Contact from "@/components/Contact";
import Navigation from "@/components/Navigation";

export default function Home() {
  return (
    <div className="bg-black min-h-screen">
      <Navigation />
      <main>
        <Hero />

        <section id="features">
          <Features />
        </section>

        <section id="pricing">
          <Pricing />
        </section>

        <section id="contact">
          <Contact />
        </section>
      </main>
    </div>
  );
}
