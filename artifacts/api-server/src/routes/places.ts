import { Router, type IRouter } from "express";

const router: IRouter = Router();

const GMAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;

interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string;
}

interface PlaceDetails {
  name: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  formatted_address?: string;
  vicinity?: string;
}

async function searchPlaces(
  keyword: string,
  location: string,
  pagetoken?: string,
): Promise<{ results: PlaceSearchResult[]; next_page_token?: string }> {
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location + ", Polska")}&key=${GMAPS_KEY}`;
  const geoResp = await fetch(geocodeUrl);
  const geoData = (await geoResp.json()) as any;

  if (!geoData.results?.[0]) {
    return { results: [] };
  }

  const { lat, lng } = geoData.results[0].geometry.location;

  let searchUrl =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
    `?location=${lat},${lng}` +
    `&radius=15000` +
    `&keyword=${encodeURIComponent(keyword)}` +
    `&language=pl` +
    `&key=${GMAPS_KEY}`;

  if (pagetoken) {
    searchUrl =
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
      `?pagetoken=${encodeURIComponent(pagetoken)}` +
      `&key=${GMAPS_KEY}`;
  }

  const resp = await fetch(searchUrl);
  const data = (await resp.json()) as any;

  return {
    results: data.results ?? [],
    next_page_token: data.next_page_token,
  };
}

async function getPlaceDetails(
  placeId: string,
): Promise<PlaceDetails | null> {
  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${encodeURIComponent(placeId)}` +
    `&fields=name,formatted_phone_number,international_phone_number,website,formatted_address,vicinity` +
    `&language=pl` +
    `&key=${GMAPS_KEY}`;

  const resp = await fetch(url);
  const data = (await resp.json()) as any;
  if (data.status !== "OK") return null;
  return data.result as PlaceDetails;
}

router.get("/places/search", async (req, res) => {
  if (!GMAPS_KEY) {
    res.status(500).json({ error: "GOOGLE_MAPS_API_KEY not configured" });
    return;
  }

  const { keyword, location, pagetoken } = req.query as {
    keyword?: string;
    location?: string;
    pagetoken?: string;
  };

  if (!keyword || !location) {
    res.status(400).json({ error: "keyword and location are required" });
    return;
  }

  try {
    const searchResult = await searchPlaces(keyword, location, pagetoken);

    const leads: Array<{
      placeId: string;
      companyName: string;
      phone: string;
      address: string;
      hasWebsite: boolean;
    }> = [];

    for (const place of searchResult.results) {
      try {
        const details = await getPlaceDetails(place.place_id);
        if (!details) continue;

        const phone =
          details.formatted_phone_number ||
          details.international_phone_number ||
          "";

        if (!phone) continue;

        if (!details.website) {
          leads.push({
            placeId: place.place_id,
            companyName: details.name,
            phone: phone.replace(/[\s-]/g, ""),
            address: details.formatted_address || details.vicinity || location,
            hasWebsite: false,
          });
        }
      } catch {
      }
    }

    res.json({
      leads,
      nextPageToken: searchResult.next_page_token ?? null,
      total: searchResult.results.length,
    });
  } catch (err) {
    req.log.error({ err }, "Places search error");
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
