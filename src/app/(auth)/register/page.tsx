import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

/** Registration no longer exists — the passphrase gate creates a workspace on first entry. */
export default function RegisterPage() {
  redirect(routes.login);
}
