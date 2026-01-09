import { BackgroundGrid } from "@/components/landing/background-grid"
import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { FeatureGrid } from "@/components/landing/feature-grid"
import { TrustSection } from "@/components/landing/trust-section"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="relative min-h-screen text-foreground overflow-hidden selection:bg-white/20">
      <BackgroundGrid />
      <Navbar />
      <div className="flex flex-col">
        <Hero />
        <FeatureGrid />
        <TrustSection />
        <Footer />
      </div>
    </main>
  )
}
