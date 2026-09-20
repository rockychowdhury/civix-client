import { AccountabilityPromise } from "@/components/landing/accountability-promise";
import { BrokenLoop } from "@/components/landing/broken-loop";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowCivixWorks } from "@/components/landing/how-civix-works";
import { Navbar } from "@/components/landing/navbar";
import { ResolvedStories } from "@/components/landing/resolved-stories";
import { SplitFlapBoard } from "@/components/landing/split-flap-board";
import { TransparencyDashboard } from "@/components/landing/transparency-dashboard";
import { TwoAudiences } from "@/components/landing/two-audiences";
import { UnderTheHood } from "@/components/landing/under-the-hood";
import { VerifiedTrusted } from "@/components/landing/verified-trusted";
import { WhereCivixRuns } from "@/components/landing/where-civix-runs";
import { getUser, getUserDisplayName } from "@/services/user.service";

export default async function Home() {
  const user = await getUser();
  const navbarUser = user ? { name: getUserDisplayName(user) } : null;

  return (
    <>
      <Navbar user={navbarUser} />
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
