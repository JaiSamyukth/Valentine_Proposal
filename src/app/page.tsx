"use client";

import { useRouter } from "@/lib/router";
import { Landing } from "@/components/experience/Landing";
import { BuilderDashboard } from "@/components/builder/BuilderDashboard";
import { ReceiverExperience } from "@/components/experience/ReceiverExperience";
import { AuroraLayer } from "@/components/world/AuroraLayer";
import { LivingBackground } from "@/components/world/LivingBackground";

export default function Home() {
  const route = useRouter();

  // Builder dashboard — sender configures the experience
  if (route.mode === "builder") {
    return (
      <div className="relative min-h-screen w-full">
        <AuroraLayer theme="aurora" />
        <LivingBackground theme="aurora" intensity="calm" />
        <div className="film-grain" />
        <BuilderDashboard />
      </div>
    );
  }

  // Receiver experience — zero-input, loads from /story/:id
  if (route.mode === "story" && route.storyId) {
    return <ReceiverExperience storyId={route.storyId} />;
  }

  // Landing — entry point
  return (
    <div className="relative min-h-screen w-full">
      <AuroraLayer theme="aurora" />
      <LivingBackground theme="aurora" intensity="normal" />
      <div className="film-grain" />
      <div className="vignette" />
      <Landing />
    </div>
  );
}
