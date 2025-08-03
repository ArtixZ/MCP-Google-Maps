#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
    SEARCH_NEARBY_TOOL,
    GET_PLACE_DETAILS_TOOL,
    GEOCODE_TOOL,
    REVERSE_GEOCODE_TOOL,
    DISTANCE_MATRIX_TOOL,
    DIRECTIONS_TOOL,
    ELEVATION_TOOL,
    MAP_DIRECTIONS_TOOL,
} from "./tools/tool-definitions.js";
import { PlacesSearcher } from "./services/places.js";
import { MapDirectionsService } from "./services/map-directions.js";
import { handleError } from "./utils/error-handling.js";
import config from "./config/environment.js";
import { LocationInput } from "./types/index.js";
import { TravelMode } from "@googlemaps/google-maps-services-js";

type ToolArgs = {
    search_nearby: {
        center: LocationInput;
        keyword?: string;
        radius?: number;
        openNow?: boolean;
        minRating?: number;
    };
    get_place_details: {
        placeId: string;
    };
    get_geocode: {
        address: string;
    };
    get_reverse_geocode: {
        latitude: number;
        longitude: number;
    };
    get_distance_matrix: {
        origins: string[];
        destinations: string[];
        mode?: TravelMode;
    };
    get_directions: {
        origin: string;
        destination: string;
        mode?: TravelMode;
    };
    get_elevation: {
        locations: Array<{ latitude: number; longitude: number }>;
    };
    get_map_with_directions: {
        origin: { address: string; lat: number; lng: number };
        destination: { address: string; lat: number; lng: number };
        waypoints?: Array<{ address: string; lat: number; lng: number }>;
        mode?: TravelMode;
        size?: { width: number; height: number };
        scale?: number;
        mapType?: "roadmap" | "satellite" | "hybrid" | "terrain";
    };
};

const tools = [
    SEARCH_NEARBY_TOOL,
    GET_PLACE_DETAILS_TOOL,
    GEOCODE_TOOL,
    REVERSE_GEOCODE_TOOL,
    DISTANCE_MATRIX_TOOL,
    DIRECTIONS_TOOL,
    ELEVATION_TOOL,
    MAP_DIRECTIONS_TOOL,
];

const placesSearcher = new PlacesSearcher();
const mapDirectionsService = new MapDirectionsService();

const server = new Server(
    {
        name: "mcp-google-maps",
        version: "0.0.6",
    },
    {
        capabilities: {
            description:
                "An MCP server providing comprehensive Google Maps integration.",
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;

        if (!args) {
            throw new Error("No parameters provided");
        }

        switch (name) {
            case "search_nearby": {
                const result = await placesSearcher.searchNearby(
                    args as ToolArgs[typeof name]
                );
                return {
                    content: [
                        { type: "text", text: JSON.stringify(result, null, 2) },
                    ],
                    isError: !result.success,
                };
            }

            case "get_place_details": {
                const result = await placesSearcher.getPlaceDetails(
                    (args as ToolArgs[typeof name]).placeId
                );
                return {
                    content: [
                        { type: "text", text: JSON.stringify(result, null, 2) },
                    ],
                    isError: !result.success,
                };
            }

            case "get_geocode": {
                const result = await placesSearcher.geocode(
                    (args as ToolArgs[typeof name]).address
                );
                return {
                    content: [
                        { type: "text", text: JSON.stringify(result, null, 2) },
                    ],
                    isError: !result.success,
                };
            }

            case "get_reverse_geocode": {
                const typedArgs = args as ToolArgs[typeof name];
                const result = await placesSearcher.reverseGeocode(
                    typedArgs.latitude,
                    typedArgs.longitude
                );
                return {
                    content: [
                        { type: "text", text: JSON.stringify(result, null, 2) },
                    ],
                    isError: !result.success,
                };
            }

            case "get_distance_matrix": {
                const typedArgs = args as ToolArgs[typeof name];
                const result = await placesSearcher.calculateDistanceMatrix(
                    typedArgs.origins,
                    typedArgs.destinations,
                    typedArgs.mode
                );
                return {
                    content: [
                        { type: "text", text: JSON.stringify(result, null, 2) },
                    ],
                    isError: !result.success,
                };
            }

            case "get_directions": {
                const typedArgs = args as ToolArgs[typeof name];
                const result = await placesSearcher.getDirections(
                    typedArgs.origin,
                    typedArgs.destination,
                    typedArgs.mode
                );
                return {
                    content: [
                        { type: "text", text: JSON.stringify(result, null, 2) },
                    ],
                    isError: !result.success,
                };
            }

            case "get_elevation": {
                const result = await placesSearcher.getElevation(
                    (args as ToolArgs[typeof name]).locations
                );
                return {
                    content: [
                        { type: "text", text: JSON.stringify(result, null, 2) },
                    ],
                    isError: !result.success,
                };
            }

            case "get_map_with_directions": {
                const typedArgs = args as ToolArgs[typeof name];
                const result =
                    await mapDirectionsService.getMapWithDirections(typedArgs);
                return {
                    content: [
                        { type: "text", text: JSON.stringify(result, null, 2) },
                    ],
                    isError: !result.success,
                };
            }

            default:
                return {
                    content: [
                        { type: "text", text: `Error: Unknown tool ${name}` },
                    ],
                    isError: true,
                };
        }
    } catch (error) {
        const errorResponse = handleError(error);
        return {
            content: [
                {
                    type: "text",
                    text: errorResponse.error || "An unknown error occurred",
                },
            ],
            isError: true,
        };
    }
});

async function runServer() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.log("MCP Google Maps Server started");
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
}

runServer();
