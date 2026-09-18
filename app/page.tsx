"use client";

import { Navbar } from "./components/navbar";
import { Hero } from "./components/hero";
import { LiveCityPulse } from "./components/live-city-pulse";
import { BrokenLoop } from "./components/broken-loop";
import { HowCivixWorks } from "./components/how-civix-works";
import { UnderTheHood } from "./components/under-the-hood";
import { TransparencyDashboard } from "./components/transparency-dashboard";
import { AccountabilityPromise } from "./components/accountability-promise";
import { TwoAudiences } from "./components/two-audiences";
import { ResolvedStories } from "./components/resolved-stories";
import { VerifiedTrusted } from "./components/verified-trusted";
import { WhereCivixRuns } from "./components/where-civix-runs";
import { FinalCTA } from "./components/final-cta";
import { Footer } from "./components/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - var(--nav-height))" }}>
        <Hero />
        <LiveCityPulse />
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