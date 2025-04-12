# MCP Google Maps

A Model Context Protocol (MCP) server for Google Maps functionality, providing access to places search, geocoding, directions, and more through the MCP interface.

## Features

- Places Search
- Place Details
- Geocoding and Reverse Geocoding
- Distance Matrix
- Directions
- Elevation Data
- Static Maps Generation

## Installation & Testing

First, install the package globally:

```bash
npm install -g mcp-google-maps
```

You can test if the MCP server is working by running:

```bash
npx mcp-google-maps
```

## MCP Configuration

To use this with your MCP client, add the following to your MCP configuration:

```json
{
    "mcpServers": {
        "google-maps": {
            "command": "mcp-google-maps",
            "env": {
                "GOOGLE_MAPS_API_KEY": "your_api_key_here",
                "DEFAULT_LANGUAGE": "en",
                "DEFAULT_REGION": "US",
                "MAX_REQUESTS_PER_SECOND": "50",
                "MAX_REQUESTS_PER_DAY": "100000",
                "ENABLE_CACHING": "true",
                "CACHE_TTL": "3600"
            },
            "enabled": true
        }
    }
}
```

## Available MCP Commands

The following commands are available through the MCP interface:

- `search_nearby`: Search for places near a location
- `get_place_details`: Get detailed information about a specific place
- `get_geocode`: Convert address to coordinates
- `get_reverse_geocode`: Convert coordinates to address
- `get_distance_matrix`: Calculate distances between multiple origins and destinations
- `get_directions`: Get directions between two points
- `get_elevation`: Get elevation data for locations
- `generate_static_map`: Generate static map images

## License

MIT

## Author

artixz
