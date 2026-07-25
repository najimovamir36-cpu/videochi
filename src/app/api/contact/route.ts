import { contactSchema } from "@/lib/validations/contact";
import { clientKey, enforceRateLimit } from "@/server/core/rate-limit";
import { created, parseJsonBody, route } from "@/server/http/responses";
import { contactService } from "@/server/services/contact-service";

/** `POST /api/contact` — records an inbound sales or support request. */
export const POST = route(async (request: Request) => {
  enforceRateLimit({
    key: clientKey(request, "contact"),
    limit: 3,
    windowMs: 10 * 60 * 1000,
  });

  const input = await parseJsonBody(request, contactSchema);
  return created(await contactService.submit(input));
});
