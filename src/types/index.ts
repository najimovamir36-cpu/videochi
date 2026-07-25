export type * from "@/types/api";
export type * from "@/types/auth";
export type * from "@/types/billing";
export type * from "@/types/media";
export type * from "@/types/upload";

/** Notification shown in the dashboard top bar. */
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  kind: "export" | "analysis" | "billing" | "system";
}

/** Global command palette / search result. */
export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  kind: "project" | "upload" | "export" | "page";
}
