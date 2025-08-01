import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
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
    </>
  );
}
