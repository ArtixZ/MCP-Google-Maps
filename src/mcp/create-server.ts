import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PlacesSearcher } from "../services/places.js";
import { MapDirectionsService } from "../services/map-directions.js";
import { handleError } from "../utils/error-handling.js";
import {
  SearchNearbySchema,
  PlaceDetailsSchema,
  GeocodeSchema,
  ReverseGeocodeSchema,
  DistanceMatrixSchema,
  DirectionsSchema,
  ElevationSchema,
  MapWithDirectionsSchema
} from "../schemas/tool-schemas.js";
import { TravelMode } from "@googlemaps/google-maps-services-js";

export function createMcpServer(): McpServer {
  const placesSearcher = new PlacesSearcher();
  const mapDirectionsService = new MapDirectionsService();

  const server = new McpServer({
    name: "mcp-google-maps",
    version: "0.1.0",
    description: "An MCP server providing comprehensive Google Maps integration."
  });

  server.registerTool("search_nearby", {
    title: "Search Nearby Places", 
    description: "Search for places near a specific location",
    inputSchema: SearchNearbySchema
  }, async (args) => {
    try {
      const result = await placesSearcher.searchNearby(args);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        isError: !result.success,
      };
    } catch (error) {
      const errorResponse = handleError(error);
      return {
        content: [{ type: "text", text: errorResponse.error || "An unknown error occurred" }],
        isError: true,
      };
    }
  });

  server.registerTool("get_place_details", {
    title: "Get Place Details",
    description: "Get detailed information about a specific place",
    inputSchema: PlaceDetailsSchema
  }, async (args) => {
    try {
      const result = await placesSearcher.getPlaceDetails(args.placeId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        isError: !result.success,
      };
    } catch (error) {
      const errorResponse = handleError(error);
      return {
        content: [{ type: "text", text: errorResponse.error || "An unknown error occurred" }],
        isError: true,
      };
    }
  });

  server.registerTool("get_geocode", {
    title: "Geocode Address",
    description: "Convert an address to coordinates",
    inputSchema: GeocodeSchema
  }, async (args) => {
    try {
      const result = await placesSearcher.geocode(args.address);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        isError: !result.success,
      };
    } catch (error) {
      const errorResponse = handleError(error);
      return {
        content: [{ type: "text", text: errorResponse.error || "An unknown error occurred" }],
        isError: true,
      };
    }
  });

  server.registerTool("get_reverse_geocode", {
    title: "Reverse Geocode",
    description: "Convert coordinates to an address",
    inputSchema: ReverseGeocodeSchema
  }, async (args) => {
    try {
      const result = await placesSearcher.reverseGeocode(args.latitude, args.longitude);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        isError: !result.success,
      };
    } catch (error) {
      const errorResponse = handleError(error);
      return {
        content: [{ type: "text", text: errorResponse.error || "An unknown error occurred" }],
        isError: true,
      };
    }
  });

  server.registerTool("get_distance_matrix", {
    title: "Distance Matrix",
    description: "Calculate distance and time between multiple origins and destinations",
    inputSchema: DistanceMatrixSchema
  }, async (args) => {
    try {
      const result = await placesSearcher.calculateDistanceMatrix(
        args.origins, 
        args.destinations, 
        args.mode as TravelMode | undefined
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        isError: !result.success,
      };
    } catch (error) {
      const errorResponse = handleError(error);
      return {
        content: [{ type: "text", text: errorResponse.error || "An unknown error occurred" }],
        isError: true,
      };
    }
  });

  server.registerTool("get_directions", {
    title: "Get Directions",
    description: "Get directions between two locations",
    inputSchema: DirectionsSchema
  }, async (args) => {
    try {
      const result = await placesSearcher.getDirections(
        args.origin, 
        args.destination, 
        args.mode as TravelMode | undefined
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        isError: !result.success,
      };
    } catch (error) {
      const errorResponse = handleError(error);
      return {
        content: [{ type: "text", text: errorResponse.error || "An unknown error occurred" }],
        isError: true,
      };
    }
  });

  server.registerTool("get_elevation", {
    title: "Get Elevation",
    description: "Get elevation data for locations",
    inputSchema: ElevationSchema
  }, async (args) => {
    try {
      const result = await placesSearcher.getElevation(args.locations);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        isError: !result.success,
      };
    } catch (error) {
      const errorResponse = handleError(error);
      return {
        content: [{ type: "text", text: errorResponse.error || "An unknown error occurred" }],
        isError: true,
      };
    }
  });

  server.registerTool("get_map_with_directions", {
    title: "Map with Directions",
    description: "Generate a static map with directions overlay",
    inputSchema: MapWithDirectionsSchema
  }, async (args) => {
    try {
      const result = await mapDirectionsService.getMapWithDirections({
        ...args,
        mode: args.mode as TravelMode | undefined
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        isError: !result.success,
      };
    } catch (error) {
      const errorResponse = handleError(error);
      return {
        content: [{ type: "text", text: errorResponse.error || "An unknown error occurred" }],
        isError: true,
      };
    }
  });

  return server;
}