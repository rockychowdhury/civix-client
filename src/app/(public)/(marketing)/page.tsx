import { Footer } from "@/components/layout/public/footer";
import { Navbar } from "@/components/layout/public/navbar";
import { AccountabilityPromise } from "@/components/modules/landing/accountability-promise";
import { BrokenLoop } from "@/components/modules/landing/broken-loop";
import { FinalCTA } from "@/components/modules/landing/final-cta";
import { Hero } from "@/components/modules/landing/hero";
import { HowCivixWorks } from "@/components/modules/landing/how-civix-works";
import { ResolvedStories } from "@/components/modules/landing/resolved-stories";
import { SplitFlapBoard } from "@/components/modules/landing/split-flap-board";
import { TransparencyDashboard } from "@/components/modules/landing/transparency-dashboard";
import { TwoAudiences } from "@/components/modules/landing/two-audiences";
import { UnderTheHood } from "@/components/modules/landing/under-the-hood";
import { VerifiedTrusted } from "@/components/modules/landing/verified-trusted";
import { WhereCivixRuns } from "@/components/modules/landing/where-civix-runs";

export const dynamic = "force-static";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-3.5rem)]">
        <Hero />
        <SplitFlapBoard />
        <BrokenLoop />
        <HowCivixWorks />
        <UnderTheHood />
        <TransparencyDashboard />
        <AccountabilityPromise />
        <TwoAudiences />
        <ResolvedStories />
        <VerifiedTrusted />
        <WhereCivixRuns />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
