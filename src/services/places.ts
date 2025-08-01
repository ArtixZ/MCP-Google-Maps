import {
    Client,
    PlaceInputType,
    TravelMode,
    LatLngLiteral,
    Language,
} from "@googlemaps/google-maps-services-js";
import {
    ServiceResponse,
    Location,
    LocationInput,
    PlaceDetails,
    DirectionsResult,
    DistanceMatrixResult,
    ElevationResult,
} from "../types";
import {
    handleError,
    validateCoordinates,
    validateRequiredString,
} from "../utils/error-handling";
import config from "../config/environment";

export class PlacesSearcher {
    private client: Client;

    constructor() {
        this.client = new Client({});
    }

    async searchNearby(params: {
        center: LocationInput;
        keyword?: string;
        radius?: number;
        openNow?: boolean;
        minRating?: number;
    }): Promise<ServiceResponse<PlaceDetails[]>> {
        try {
            let location: Location;

            if (params.center.isCoordinates) {
                const [lat, lng] = params.center.value.split(",").map(Number);
                validateCoordinates(lat, lng);
                location = { lat, lng };
            } else {
                const geocodeResult = await this.geocode(params.center.value);
                if (!geocodeResult.success || !geocodeResult.data) {
                    throw new Error("Failed to geocode center location");
                }
                location = geocodeResult.data;
            }

            const response = await this.client.placesNearby({
                params: {
                    key: config.googleMapsApiKey,
                    location: location,
                    radius: params.radius || 1000,
                    keyword: params.keyword,
                    opennow: params.openNow,
                    language: config.defaultLanguage,
                },
            });

            let places = response.data.results.map((place) => {
                if (!place.geometry || !place.place_id || !place.name) {
                    throw new Error("Required place data is missing");
                }
                return {
                    placeId: place.place_id,
                    name: place.name,
                    location: place.geometry.location,
                    rating: place.rating,
                    userRatingsTotal: place.user_ratings_total,
                    types: place.types,
                    vicinity: place.vicinity,
                };
            });

            if (params.minRating) {
                places = places.filter(
                    (place) => (place.rating || 0) >= (params.minRating || 0)
                );
            }

            return {
                success: true,
                data: places,
            };
        } catch (error) {
            return handleError(error);
        }
    }

    async getPlaceDetails(
        placeId: string
    ): Promise<ServiceResponse<PlaceDetails>> {
        try {
            validateRequiredString(placeId, "Place ID");

            const response = await this.client.placeDetails({
                params: {
                    key: config.googleMapsApiKey,
                    place_id: placeId,
                    language: config.defaultLanguage as Language,
                    fields: [
                        "name",
                        "formatted_address",
                        "geometry",
                        "googleMapsLinks",
                        "rating",
                        "reviews",
                        "reviewSummary",
                        "user_ratings_total",
                        "opening_hours",
                        "photos",
                        "price_level",
                        "types",
                        "website",
                        "formatted_phone_number",
                    ],
                },
            });

            const place = response.data.result;

            // First check if the API call was successful
            if (response.data.status !== "OK") {
                throw new Error(
                    `Google Places API error: ${response.data.status} - ${response.data.error_message || "Unknown error"}`
                );
            }

            // Check if we have a result
            if (!place) {
                throw new Error(
                    "No place data returned from Google Places API"
                );
            }

            // Check for required fields with detailed error message
            if (!place.place_id || !place.name) {
                throw new Error(
                    `Missing required place data - place_id: ${place.place_id || "undefined"}, name: ${place.name || "undefined"}, API status: ${response.data.status}`
                );
            }
            return {
                success: true,
                data: {
                    placeId: place.place_id,
                    name: place.name,
                    formattedAddress: place.formatted_address,
                    location: place.geometry?.location,
                    rating: place.rating,
                    userRatingsTotal: place.user_ratings_total,
                    openingHours: place.opening_hours
                        ? {
                              openNow: place.opening_hours.open_now,
                              periods: place.opening_hours.periods?.map(
                                  (period) => ({
                                      open: {
                                          day: period.open.day,
                                          time: period.open.time || "",
                                      },
                                      close: period.close
                                          ? {
                                                day: period.close.day,
                                                time: period.close.time || "",
                                            }
                                          : { day: 0, time: "" },
                                  })
                              ),
                          }
                        : undefined,
                    photos: place.photos?.map((photo) => ({
                        photoReference: photo.photo_reference,
                        height: photo.height,
                        width: photo.width,
                    })),
                    priceLevel: place.price_level,
                    types: place.types,
                    website: place.website,
                    phoneNumber: place.formatted_phone_number,
                },
            };
        } catch (error) {
            return handleError(error);
        }
    }

    async geocode(address: string): Promise<ServiceResponse<Location>> {
        try {
            validateRequiredString(address, "Address");

            const response = await this.client.geocode({
                params: {
                    key: config.googleMapsApiKey,
                    address: address,
                    language: config.defaultLanguage as Language,
                    region: config.defaultRegion,
                },
            });

            if (response.data.results.length === 0) {
                throw new Error("No results found for the given address");
            }

            const location = response.data.results[0].geometry.location;
            return {
                success: true,
                data: {
                    lat: location.lat,
                    lng: location.lng,
                    address: response.data.results[0].formatted_address,
                    placeId: response.data.results[0].place_id,
                },
            };
        } catch (error) {
            return handleError(error);
        }
    }

    async reverseGeocode(
        latitude: number,
        longitude: number
    ): Promise<ServiceResponse<Location>> {
        try {
            validateCoordinates(latitude, longitude);

            const response = await this.client.reverseGeocode({
                params: {
                    key: config.googleMapsApiKey,
                    latlng: { lat: latitude, lng: longitude },
                    language: config.defaultLanguage as Language,
                },
            });

            if (response.data.results.length === 0) {
                throw new Error("No results found for the given coordinates");
            }

            const result = response.data.results[0];
            return {
                success: true,
                data: {
                    lat: latitude,
                    lng: longitude,
                    address: result.formatted_address,
                    placeId: result.place_id,
                },
            };
        } catch (error) {
            return handleError(error);
        }
    }

    async calculateDistanceMatrix(
        origins: string[],
        destinations: string[],
        mode: TravelMode = TravelMode.driving
    ): Promise<ServiceResponse<DistanceMatrixResult>> {
        try {
            const response = await this.client.distancematrix({
                params: {
                    key: config.googleMapsApiKey,
                    origins,
                    destinations,
                    mode,
                    language: config.defaultLanguage as Language,
                },
            });

            return {
                success: true,
                data: {
                    originAddresses: response.data.origin_addresses,
                    destinationAddresses: response.data.destination_addresses,
                    rows: response.data.rows,
                },
            };
        } catch (error) {
            return handleError(error);
        }
    }

    async getDirections(
        origin: string,
        destination: string,
        mode: TravelMode = TravelMode.driving
    ): Promise<ServiceResponse<DirectionsResult>> {
        try {
            validateRequiredString(origin, "Origin");
            validateRequiredString(destination, "Destination");

            const response = await this.client.directions({
                params: {
                    key: config.googleMapsApiKey,
                    origin,
                    destination,
                    mode,
                    language: config.defaultLanguage as Language,
                },
            });

            if (response.data.routes.length === 0) {
                throw new Error("No route found");
            }

            return {
                success: true,
                data: {
                    routes: response.data.routes.map((route) => ({
                        summary: route.summary,
                        legs: route.legs.map((leg) => ({
                            distance: leg.distance,
                            duration: leg.duration,
                            startAddress: leg.start_address,
                            endAddress: leg.end_address,
                            steps: leg.steps.map((step) => ({
                                distance: step.distance,
                                duration: step.duration,
                                instructions: step.html_instructions,
                                travelMode: step.travel_mode,
                            })),
                        })),
                    })),
                },
            };
        } catch (error) {
            return handleError(error);
        }
    }

    async getElevation(
        locations: Array<{ latitude: number; longitude: number }>
    ): Promise<ServiceResponse<ElevationResult[]>> {
        try {
            const locations_array = locations.map((loc) => {
                validateCoordinates(loc.latitude, loc.longitude);
                return { lat: loc.latitude, lng: loc.longitude };
            });

            const response = await this.client.elevation({
                params: {
                    key: config.googleMapsApiKey,
                    locations: locations_array,
                },
            });

            return {
                success: true,
                data: response.data.results.map((result) => ({
                    elevation: result.elevation,
                    location: result.location,
                    resolution: result.resolution,
                })),
            };
        } catch (error) {
            return handleError(error);
        }
    }
}
