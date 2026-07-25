import type { Transition, Variants } from "framer-motion";

/**
 * Shared Framer Motion primitives.
 * Centralised so every surface animates with the same physics and easing.
 */

export const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const springSoft: Transition = { type: "spring", stiffness: 260, damping: 26, mass: 0.9 };
export const springSnappy: Transition = { type: "spring", stiffness: 420, damping: 32, mass: 0.7 };

export const transitionBase: Transition = { duration: 0.55, ease: EASE_PREMIUM };
export const transitionFast: Transition = { duration: 0.28, ease: EASE_OUT };

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitionBase },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transitionBase },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: transitionBase },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transitionBase },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: transitionBase },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: transitionBase },
};

/** Parent container that reveals children one after another. */
export function staggerContainer(stagger = 0.08, delayChildren = 0): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
}

/** Page-level transition used by the route transition wrapper. */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_PREMIUM } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.22, ease: EASE_OUT } },
};

/** Standard hover/press feedback for interactive cards. */
export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -6, scale: 1.01, transition: springSoft },
  tap: { scale: 0.995, transition: springSnappy },
} satisfies Variants;

/** Viewport config so sections animate once, slightly before entering view. */
export const viewportOnce = { once: true, margin: "-80px 0px -80px 0px" } as const;
