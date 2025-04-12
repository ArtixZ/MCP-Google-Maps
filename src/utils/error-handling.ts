import { ServiceResponse } from '../types';

export class GoogleMapsError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'GoogleMapsError';
  }
}

export function handleError(error: unknown): ServiceResponse<never> {
  if (error instanceof GoogleMapsError) {
    return {
      success: false,
      error: `${error.name}: ${error.message}${error.code ? ` (Code: ${error.code})` : ''}`,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: false,
    error: 'An unknown error occurred',
  };
}

export function validateApiKey(apiKey: string): void {
  if (!apiKey) {
    throw new GoogleMapsError('Google Maps API key is required');
  }
}

export function validateCoordinates(lat: number, lng: number): void {
  if (lat < -90 || lat > 90) {
    throw new GoogleMapsError('Invalid latitude. Must be between -90 and 90 degrees');
  }
  if (lng < -180 || lng > 180) {
    throw new GoogleMapsError('Invalid longitude. Must be between -180 and 180 degrees');
  }
}

export function validateRequiredString(value: string, fieldName: string): void {
  if (!value || value.trim().length === 0) {
    throw new GoogleMapsError(`${fieldName} is required`);
  }
} 