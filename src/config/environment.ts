import dotenv from "dotenv";
import { Client, Language } from "@googlemaps/google-maps-services-js";

dotenv.config();

export interface Config {
    googleMapsApiKey: string;
    defaultLanguage: Language;
    defaultRegion: string;
    rateLimit: {
        maxRequestsPerSecond: number;
        maxRequestsPerDay: number;
    };
    caching: {
        enabled: boolean;
        ttl: number; // Time to live in seconds
    };
}

const config: Config = {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
    defaultLanguage: (process.env.DEFAULT_LANGUAGE || "en") as Language,
    defaultRegion: process.env.DEFAULT_REGION || "US",
    rateLimit: {
        maxRequestsPerSecond: Number(process.env.MAX_REQUESTS_PER_SECOND) || 50,
        maxRequestsPerDay: Number(process.env.MAX_REQUESTS_PER_DAY) || 100000,
    },
    caching: {
        enabled: process.env.ENABLE_CACHING === "true",
        ttl: Number(process.env.CACHE_TTL) || 3600,
    },
};

if (!config.googleMapsApiKey) {
    throw new Error(
        "Google Maps API key is required. Please set GOOGLE_MAPS_API_KEY environment variable."
    );
}

export const googleMapsClient = new Client({});

export default config;
