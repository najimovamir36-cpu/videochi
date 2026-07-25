import { FeatureCard } from "@/components/marketing/feature-card";
import { Stagger } from "@/components/motion/stagger";
import { SectionHeading } from "@/components/shared/section-heading";
import { features } from "@/data/features";

/** The eight-capability grid. */
export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-24 py-24 sm:py-32">
      <div className="container">
        <SectionHeading
          eyebrow="Everything included"
          title={
            <>
              One upload. <span className="text-gradient-brand">Every short</span> you need.
            </>
          }
          description="A complete post-production pipeline that runs on its own — from finding the moment to delivering a platform-ready vertical file."
        />

        <Stagger
          as="ul"
          stagger={0.06}
          className="mt-14 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map(({ id, icon: Icon, ...feature }) => (
            <FeatureCard key={id} {...feature} icon={<Icon className="size-[19px]" />} />
          ))}
        </Stagger>
      </div>
    </section>
  );
}
