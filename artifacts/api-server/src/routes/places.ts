import { Router, type IRouter } from "express";

const router: IRouter = Router();

const GMAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;

const PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText";
const FIELD_MASK =
  "places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.nationalPhoneNumber,places.websiteUri";

interface PlaceResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
}

interface PlacesApiResponse {
  places?: PlaceResult[];
  error?: { code: number; message: string; status: string };
}

async function searchPlacesNew(
  query: string,
  maxResults: number = 20,
): Promise<PlaceResult[]> {
  const body = {
    textQuery: query,
    languageCode: "pl",
    regionCode: "PL",
    maxResultCount: Math.min(maxResults, 20),
  };

  const resp = await fetch(PLACES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GMAPS_KEY!,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  const data = (await resp.json()) as PlacesApiResponse;

  if (data.error) {
    throw new Error(`Places API error ${data.error.code}: ${data.error.message}`);
  }

  return data.places ?? [];
}

router.get("/places/search", async (req, res) => {
  if (!GMAPS_KEY) {
    res.status(500).json({ error: "GOOGLE_MAPS_API_KEY not configured" });
    return;
  }

  const { keyword, location } = req.query as {
    keyword?: string;
    location?: string;
  };

  if (!keyword || !location) {
    res.status(400).json({ error: "keyword and location are required" });
    return;
  }

  const query = `${keyword} ${location} Polska`;

  try {
    const places = await searchPlacesNew(query, 20);

    const leads: Array<{
      placeId: string;
      companyName: string;
      phone: string;
      address: string;
      hasWebsite: boolean;
    }> = [];

    for (const place of places) {
      const name = place.displayName?.text ?? "";
      const phone =
        place.internationalPhoneNumber ?? place.nationalPhoneNumber ?? "";
      const address = place.formattedAddress ?? location;
      const hasWebsite = !!place.websiteUri;

      if (!name || !phone) continue;

      if (!hasWebsite) {
        leads.push({
          placeId: place.id,
          companyName: name,
          phone: phone.replace(/\s/g, ""),
          address,
          hasWebsite: false,
        });
      }
    }

    res.json({
      leads,
      total: places.length,
      withoutWebsite: leads.length,
    });
  } catch (err: any) {
    req.log.error({ err }, "Places search error");
    res.status(500).json({ error: err?.message ?? "Search failed" });
  }
});

export default router;
