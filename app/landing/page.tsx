import { Navbar } from "./_components/navbar";
import { Hero } from "./_components/hero";
import { Features } from "./_components/features";
import { Pricing } from "./_components/pricing";
import { FAQ } from "./_components/faq";
import { CTA } from "./_components/cta";
import { Footer } from "./_components/footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
