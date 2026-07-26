import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

/** No per-account password to reset — there's only the shared passphrase. */
export default function ResetPasswordPage() {
  redirect(routes.login);
}
