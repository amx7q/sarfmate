import { Suspense } from "react";
import { getAllRoots } from "@/lib/roots";
import Hero from "@/components/Hero";
import HomeSearch from "@/components/HomeSearch";
import FeatureCards from "@/components/FeatureCards";
import CommunityPanel from "@/components/CommunityPanel";

export default function HomePage() {
  const roots = getAllRoots();
  return (
    <>
      <Hero />
      <Suspense fallback={null}>
        <HomeSearch roots={roots} />
      </Suspense>
      <FeatureCards />
      <CommunityPanel />
    </>
  );
}
