import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const MAP_DIRECTIONS_TOOL: Tool = {
    name: "get_map_with_directions",
    description:
        "Generate a map visualization showing directions from origin to destination with optional waypoints. Returns both an interactive Google Maps URL and a static map image URL.",
    inputSchema: {
        type: "object",
        properties: {
            origin: {
                type: "object",
                description: "Starting point of the route",
                properties: {
                    address: {
                        type: "string",
                        description:
                            "Human-readable address (e.g., 'Sydney Opera House, Sydney NSW')",
                    },
                    lat: {
                        type: "number",
                        description: "Latitude coordinate",
                    },
                    lng: {
                        type: "number",
                        description: "Longitude coordinate",
                    },
                },
                required: ["address", "lat", "lng"],
            },
            destination: {
                type: "object",
                description: "End point of the route",
                properties: {
                    address: {
                        type: "string",
                        description: "Human-readable address",
                    },
                    lat: {
                        type: "number",
                        description: "Latitude coordinate",
                    },
                    lng: {
                        type: "number",
                        description: "Longitude coordinate",
                    },
                },
                required: ["address", "lat", "lng"],
            },
            waypoints: {
                type: "array",
                description: "Optional intermediate stops along the route",
                items: {
                    type: "object",
                    properties: {
                        address: {
                            type: "string",
                            description: "Human-readable address of waypoint",
                        },
                        lat: {
                            type: "number",
                            description: "Latitude coordinate",
                        },
                        lng: {
                            type: "number",
                            description: "Longitude coordinate",
                        },
                    },
                    required: ["address", "lat", "lng"],
                },
            },
            mode: {
                type: "string",
                description: "Travel mode for directions",
                enum: ["driving", "walking", "bicycling", "transit"],
                default: "driving",
            },
            size: {
                type: "object",
                description: "Size of the static map image",
                properties: {
                    width: {
                        type: "number",
                        description: "Width in pixels (max 640 for free tier)",
                        default: 640,
                    },
                    height: {
                        type: "number",
                        description: "Height in pixels (max 640 for free tier)",
                        default: 480,
                    },
                },
            },
            scale: {
                type: "number",
                description: "Scale factor for high-DPI displays (1 or 2)",
                enum: [1, 2],
                default: 2,
            },
            mapType: {
                type: "string",
                description: "Map type for static map",
                enum: ["roadmap", "satellite", "hybrid", "terrain"],
                default: "roadmap",
            },
        },
        required: ["origin", "destination"],
    },
};
