// apps/rider/src/app/page.tsx
import { redirect } from "next/navigation";
import { ROUTES } from "@/config/constants";

/** "/" has no screen of its own: riders always land on Home. */
export default function RootPage() {
  redirect(ROUTES.home);
}
