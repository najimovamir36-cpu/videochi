"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { HeroShowcase } from "@/components/marketing/hero-showcase";
import { Ripple } from "@/components/motion/ripple";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { routes } from "@/config/routes";
import { socialProof } from "@/data/testimonials";
import { EASE_PREMIUM, staggerContainer } from "@/lib/motion";

const headline = ["Upload Long Videos.", "Get Viral Shorts", "Automatically."];

/** Above-the-fold hero: headline, dual CTA, social proof and product showcase. */
export function HeroSection() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="relative overflow-hidden pb-16 pt-32 sm:pb-24 sm:pt-40 lg:pt-44">
      <div className="container">
        <motion.div
          variants={staggerContainer(0.09, 0.05)}
          initial="hidden"
          animate="visible"
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_PREMIUM } },
            }}
          >
            <Link
              href={routes.pricing}
              className="group inline-flex items-center gap-2.5 rounded-full border border-white/[0.09] bg-white/[0.04] py-1.5 pl-2 pr-4 text-[12.5px] text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-primary/35 hover:bg-primary/[0.07] hover:text-foreground"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-white">
                <Sparkles className="size-3" />
                New
              </span>
              Speaker detection now runs on every upload
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          <h1 className="mt-8 text-balance text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-6xl lg:text-[4.5rem]">
            {headline.map((line, index) => (
              <motion.span
                key={line}
                className="block"
                variants={{
                  hidden: { opacity: 0, y: 26, filter: "blur(8px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.75, ease: EASE_PREMIUM },
                  },
                }}
              >
                {index === 1 ? (
                  <span className="text-gradient-brand animate-gradient-pan">{line}</span>
                ) : (
                  <span className="text-gradient">{line}</span>
                )}
              </motion.span>
            ))}
          </h1>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_PREMIUM } },
            }}
            className="mt-7 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-[17px] sm:leading-[1.7]"
          >
            Upload podcasts, interviews, webinars or YouTube videos. Our AI automatically finds viral
            moments, creates captions, tracks speakers, and exports beautiful vertical videos.
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_PREMIUM } },
            }}
            className="mt-10 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
          >
            <Ripple className="w-full rounded-xl sm:w-auto">
              <Button asChild variant="gradient" size="xl" className="w-full sm:w-auto">
                <Link href={routes.register}>
                  Start Free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Ripple>

            <Button
              variant="outline"
              size="xl"
              className="w-full sm:w-auto"
              onClick={() => setDemoOpen(true)}
              icon={
                <span className="grid size-6 place-items-center rounded-full bg-white/10">
                  <Play className="size-2.5 translate-x-[0.5px]" fill="currentColor" />
                </span>
              }
            >
              Watch Demo
            </Button>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.7, delay: 0.1 } },
            }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-6"
          >
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-3.5 fill-warning text-warning" />
              ))}
              <span className="ml-1 text-[13px] text-muted-foreground">
                4.9 from 1,284 creators
              </span>
            </div>
            <span className="hidden h-4 w-px bg-white/10 sm:block" />
            <p className="text-[13px] text-muted-foreground">
              No credit card required · 60 free minutes
            </p>
          </motion.div>
        </motion.div>

        <HeroShowcase />

        <dl className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-8 border-t border-white/[0.06] pt-10 sm:mt-20 sm:grid-cols-4">
          {socialProof.map((item) => (
            <div key={item.label} className="text-center">
              <dt className="text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
                {item.label}
              </dt>
              <dd className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                <AnimatedNumber
                  value={item.value}
                  decimals={item.decimals}
                  suffix={item.suffix}
                />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Product walkthrough</DialogTitle>
            <DialogDescription>
              A two-minute tour of the upload, analysis and export flow.
            </DialogDescription>
          </DialogHeader>

          <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/[0.08] bg-[radial-gradient(120%_110%_at_20%_0%,rgba(124,92,255,0.4),transparent_62%)]">
            <div className="noise absolute inset-0" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="relative grid size-16 place-items-center rounded-full bg-white/[0.14] ring-1 ring-white/25">
                  <span className="absolute inset-0 animate-pulse-ring rounded-full ring-1 ring-white/30" />
                  <Play className="size-6 translate-x-[2px] text-white" fill="currentColor" />
                </span>
                <p className="text-sm text-muted-foreground">
                  The walkthrough recording is added when the render pipeline ships.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
