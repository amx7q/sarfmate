import { getPublicRootEntries } from "@/lib/publicData";

export const dynamic = "force-static";

export function GET() {
  return Response.json(getPublicRootEntries(), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
