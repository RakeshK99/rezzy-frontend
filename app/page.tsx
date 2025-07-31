import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Pricing from '@/components/pricing'; // ✅ import the Pricing component

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Pricing /> {/* ✅ this adds the pricing section to your homepage */}
    </>
  );
}
