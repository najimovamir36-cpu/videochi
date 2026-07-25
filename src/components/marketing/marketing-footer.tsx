import { Github, Linkedin, Twitter, Youtube } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { footerColumns } from "@/config/navigation";
import { siteConfig } from "@/config/site";

const SOCIALS = [
  { href: siteConfig.links.twitter, label: "X (Twitter)", icon: Twitter },
  { href: siteConfig.links.github, label: "GitHub", icon: Github },
  { href: siteConfig.links.linkedin, label: "LinkedIn", icon: Linkedin },
  { href: siteConfig.links.youtube, label: "YouTube", icon: Youtube },
];

export function MarketingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-white/[0.012]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden
      />

      <div className="container py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2.6fr]">
          <div className="flex flex-col gap-5">
            <Logo />
            <p className="max-w-xs text-[13.5px] leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>

            <div className="flex items-center gap-2">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={social.label}
                  className="grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-muted-foreground transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:border-white/20 hover:text-foreground"
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>

            <div className="mt-2 inline-flex items-center gap-2 text-[12px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success shadow-[0_0_8px_1px_hsl(var(--success)/0.7)]" />
              All systems operational
            </div>
          </div>

          <nav
            className="grid grid-cols-2 gap-8 sm:grid-cols-4"
            aria-label="Footer"
          >
            {footerColumns.map((column) => (
              <div key={column.title} className="flex flex-col gap-3.5">
                <h3 className="font-display text-[13px] font-semibold tracking-tight">
                  {column.title}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {column.items.map((item) => (
                    <li key={`${column.title}-${item.label}`}>
                      <Link
                        href={item.href}
                        className="text-[13px] text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-7 sm:flex-row sm:items-center">
          <p className="text-[12.5px] text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.company.legalName}. All rights reserved.
          </p>
          <p className="text-[12.5px] text-muted-foreground">
            {siteConfig.company.address}
          </p>
        </div>
      </div>
    </footer>
  );
}
