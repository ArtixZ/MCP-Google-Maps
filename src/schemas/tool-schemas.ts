import { z } from "zod";

const LocationInputSchema = z.object({
  value: z.string().describe("Address, place name or coordinates (format: lat,lng)"),
  isCoordinates: z.boolean().optional().default(false).describe("Whether the value is coordinates")
});

const TravelModeSchema = z.enum(["driving", "walking", "bicycling", "transit"]).default("driving");

export const SearchNearbySchema = {
  center: LocationInputSchema,
  keyword: z.string().optional().describe("Search keyword (e.g., restaurant, coffee)"),
  radius: z.number().optional().default(1000).describe("Search radius in meters"),
  openNow: z.boolean().optional().default(false).describe("Only show places that are currently open"),
  minRating: z.number().min(0).max(5).optional().describe("Minimum rating requirement (0-5)")
};

export const PlaceDetailsSchema = {
  placeId: z.string().describe("Google Maps Place ID")
};

export const GeocodeSchema = {
  address: z.string().describe("Address or place name to convert")
};

export const ReverseGeocodeSchema = {
  latitude: z.number().describe("Latitude coordinate"),
  longitude: z.number().describe("Longitude coordinate")
};

export const DistanceMatrixSchema = {
  origins: z.array(z.string()).describe("List of origin addresses or coordinates"),
  destinations: z.array(z.string()).describe("List of destination addresses or coordinates"),
  mode: TravelModeSchema.optional().describe("Travel mode")
};

export const DirectionsSchema = {
  origin: z.string().describe("Starting point address or coordinates"),
  destination: z.string().describe("Destination address or coordinates"),
  mode: TravelModeSchema.optional().describe("Travel mode")
};

export const ElevationSchema = {
  locations: z.array(z.object({
    latitude: z.number(),
    longitude: z.number()
  })).describe("List of locations to get elevation data for")
};

export const MapWithDirectionsSchema = {
  origin: z.object({
    address: z.string(),
    lat: z.number(),
    lng: z.number()
  }),
  destination: z.object({
    address: z.string(),
    lat: z.number(),
    lng: z.number()
  }),
  waypoints: z.array(z.object({
    address: z.string(),
    lat: z.number(),
    lng: z.number()
  })).optional(),
  mode: TravelModeSchema.optional(),
  size: z.object({
    width: z.number(),
    height: z.number()
  }).optional(),
  scale: z.number().optional(),
  mapType: z.enum(["roadmap", "satellite", "hybrid", "terrain"]).optional()
};