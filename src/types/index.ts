import { LatLngLiteral } from "@googlemaps/google-maps-services-js";

export interface ServiceResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface Location {
    lat: number;
    lng: number;
    address?: string;
    placeId?: string;
}

export interface LocationInput {
    value: string;
    isCoordinates: boolean;
}

export interface PlaceDetails {
    placeId: string;
    name: string;
    formattedAddress?: string;
    location?: LatLngLiteral;
    rating?: number;
    userRatingsTotal?: number;
    openingHours?: {
        openNow?: boolean;
        periods?: Array<{
            open: { day: number; time: string };
            close: { day: number; time: string };
        }>;
    };
    photos?: Array<{
        photoReference: string;
        height: number;
        width: number;
    }>;
    priceLevel?: number;
    types?: string[];
    website?: string;
    phoneNumber?: string;
}

export interface DirectionsResult {
    routes: Array<{
        summary: string;
        legs: Array<{
            distance: { text: string; value: number };
            duration: { text: string; value: number };
            startAddress: string;
            endAddress: string;
            steps: Array<{
                distance: { text: string; value: number };
                duration: { text: string; value: number };
                instructions: string;
                travelMode: string;
            }>;
        }>;
    }>;
}

export type TravelMode = "driving" | "walking" | "bicycling" | "transit";

export interface DistanceMatrixResult {
    originAddresses: string[];
    destinationAddresses: string[];
    rows: Array<{
        elements: Array<{
            status: string;
            duration?: { text: string; value: number };
            distance?: { text: string; value: number };
        }>;
    }>;
}

export interface ElevationResult {
    elevation: number;
    location: LatLngLiteral;
    resolution: number;
}
