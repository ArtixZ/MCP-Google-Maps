import { Tool } from "@modelcontextprotocol/sdk/types";

export const SEARCH_NEARBY_TOOL: Tool = {
    name: "search_nearby",
    description: "Search for places near a specific location",
    inputSchema: {
        type: "object",
        properties: {
            center: {
                type: "object",
                description: "Search center point",
                required: ["value"],
                properties: {
                    value: {
                        type: "string",
                        description:
                            "Address, place name or coordinates (format: lat,lng)",
                    },
                    isCoordinates: {
                        type: "boolean",
                        description: "Whether the value is coordinates",
                        default: false,
                    },
                },
            },
            keyword: {
                type: "string",
                description: "Search keyword (e.g., restaurant, coffee)",
            },
            radius: {
                type: "number",
                description: "Search radius in meters",
                default: 1000,
            },
            openNow: {
                type: "boolean",
                description: "Only show places that are currently open",
                default: false,
            },
            minRating: {
                type: "number",
                description: "Minimum rating requirement (0-5)",
                minimum: 0,
                maximum: 5,
            },
        },
        required: ["center"],
    },
};

// Re-export existing tools with English descriptions
export const GET_PLACE_DETAILS_TOOL: Tool = {
    name: "get_place_details",
    description: "Get detailed information about a specific place",
    inputSchema: {
        type: "object",
        properties: {
            placeId: {
                type: "string",
                description: "Google Maps Place ID",
            },
        },
        required: ["placeId"],
    },
};

export const GEOCODE_TOOL: Tool = {
    name: "get_geocode",
    description: "Convert an address to coordinates",
    inputSchema: {
        type: "object",
        properties: {
            address: {
                type: "string",
                description: "Address or place name to convert",
            },
        },
        required: ["address"],
    },
};

export const REVERSE_GEOCODE_TOOL: Tool = {
    name: "get_reverse_geocode",
    description: "Convert coordinates to an address",
    inputSchema: {
        type: "object",
        properties: {
            latitude: {
                type: "number",
                description: "Latitude coordinate",
            },
            longitude: {
                type: "number",
                description: "Longitude coordinate",
            },
        },
        required: ["latitude", "longitude"],
    },
};

export const DISTANCE_MATRIX_TOOL: Tool = {
    name: "get_distance_matrix",
    description:
        "Calculate distance and time between multiple origins and destinations",
    inputSchema: {
        type: "object",
        properties: {
            origins: {
                type: "array",
                items: { type: "string" },
                description: "List of origin addresses or coordinates",
            },
            destinations: {
                type: "array",
                items: { type: "string" },
                description: "List of destination addresses or coordinates",
            },
            mode: {
                type: "string",
                enum: ["driving", "walking", "bicycling", "transit"],
                default: "driving",
                description: "Travel mode",
            },
        },
        required: ["origins", "destinations"],
    },
};

export const DIRECTIONS_TOOL: Tool = {
    name: "get_directions",
    description: "Get directions between two locations",
    inputSchema: {
        type: "object",
        properties: {
            origin: {
                type: "string",
                description: "Starting point address or coordinates",
            },
            destination: {
                type: "string",
                description: "Destination address or coordinates",
            },
            mode: {
                type: "string",
                enum: ["driving", "walking", "bicycling", "transit"],
                default: "driving",
                description: "Travel mode",
            },
        },
        required: ["origin", "destination"],
    },
};

export const ELEVATION_TOOL: Tool = {
    name: "get_elevation",
    description: "Get elevation data for locations",
    inputSchema: {
        type: "object",
        properties: {
            locations: {
                type: "array",
                items: {
                    type: "object",
                    required: ["latitude", "longitude"],
                    properties: {
                        latitude: { type: "number" },
                        longitude: { type: "number" },
                    },
                },
                description: "List of locations to get elevation data for",
            },
        },
        required: ["locations"],
    },
};

export { MAP_DIRECTIONS_TOOL } from "./map-directions-tool";
