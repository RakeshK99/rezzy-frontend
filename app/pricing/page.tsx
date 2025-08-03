import Pricing from "@/components/Pricing";
import Navigation from "@/components/Navigation";

export default function PricingPage() {
  return (
    <div className="bg-black min-h-screen">
      <Navigation />
      <main>
        <section id="pricing">
          <Pricing />
        </section>
      </main>
    </div>
  );
} 