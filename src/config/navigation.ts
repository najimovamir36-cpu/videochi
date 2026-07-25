import {
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Sparkles,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";

import { routes } from "@/config/routes";

export type MarketingNavItem = {
  label: string;
  href: string;
  description?: string;
};

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  badge?: string;
};

export type FooterColumn = {
  title: string;
  items: MarketingNavItem[];
};

export const marketingNav: MarketingNavItem[] = [
  { label: "Features", href: "/#features", description: "Everything inside the studio" },
  { label: "How it works", href: "/#how-it-works", description: "From upload to export" },
  { label: "Pricing", href: routes.pricing, description: "Plans for every creator" },
  { label: "FAQ", href: "/#faq", description: "Answers to common questions" },
];

export const dashboardNav: DashboardNavItem[] = [
  {
    label: "Home",
    href: routes.dashboard,
    icon: LayoutDashboard,
    description: "Overview and activity",
  },
  {
    label: "Projects",
    href: routes.projects,
    icon: FolderKanban,
    description: "Clip collections per video",
  },
  {
    label: "Uploads",
    href: routes.uploads,
    icon: UploadCloud,
    description: "Source footage library",
  },
  {
    label: "Exports",
    href: routes.exports,
    icon: Sparkles,
    description: "Rendered vertical clips",
  },
];

export const dashboardSecondaryNav: DashboardNavItem[] = [
  {
    label: "Settings",
    href: routes.settings,
    icon: Settings,
    description: "Workspace and preferences",
  },
  {
    label: "Billing",
    href: routes.billing,
    icon: CreditCard,
    description: "Plan, credits and invoices",
  },
];

export const footerColumns: FooterColumn[] = [
  {
    title: "Product",
    items: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: routes.pricing },
      { label: "Changelog", href: "/#faq" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "Contact", href: routes.contact },
      { label: "Testimonials", href: "/#testimonials" },
      { label: "Careers", href: routes.contact },
      { label: "Press", href: routes.contact },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Get started", href: routes.register },
      { label: "Sign in", href: routes.login },
      { label: "Reset password", href: routes.forgotPassword },
      { label: "Support", href: routes.contact },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Terms of Service", href: routes.terms },
      { label: "Privacy Policy", href: routes.privacy },
      { label: "Cookie Policy", href: routes.privacy },
      { label: "DPA", href: routes.terms },
    ],
  },
];
