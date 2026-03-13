import { redirect } from "next/navigation";
import { getSeasons } from "@/lib/api";

export default async function DriversPage() {
  let latestYear = new Date().getFullYear();
  try {
    const data = await getSeasons();
    if (data.seasons.length > 0) {
      latestYear = data.seasons[0];
    }
  } catch {
    // fallback
  }

  redirect(`/drivers/${latestYear}`);
}
