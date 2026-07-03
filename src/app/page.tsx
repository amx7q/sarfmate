import { Suspense } from "react";
import Hero from "@/components/Hero";
import HomeSearch from "@/components/HomeSearch";
import FeatureCards from "@/components/FeatureCards";
import CommunityPanel from "@/components/CommunityPanel";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Suspense fallback={null}>
        <HomeSearch />
      </Suspense>
      <FeatureCards />
      <CommunityPanel />
    </>
  );
}
