import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HeroSection from '@/components/landing/HeroSection'
import StatsSection from '@/components/landing/StatsSection'
import FeatureSection from '@/components/landing/FeatureSection'
import CTASection from '@/components/landing/CTASection'

export default function LandingPage() {
  console.log("Landing page loaded")
  return (
    <>
      {/* <Navbar /> */}
      <main className="pt-20">
        <HeroSection />
        <StatsSection />
        <FeatureSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}