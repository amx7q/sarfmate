import { getPublicRootEntries } from "@/lib/publicData";

export const dynamic = "force-static";

export function GET() {
  return Response.json(getPublicRootEntries(), {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
