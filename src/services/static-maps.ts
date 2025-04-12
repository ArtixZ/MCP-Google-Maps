import { Client } from '@googlemaps/google-maps-services-js';
import { ServiceResponse, StaticMapOptions } from '../types';
import { handleError, validateCoordinates } from '../utils/error-handling';
import config from '../config/environment';

export class StaticMapsService {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  async generateStaticMap(options: StaticMapOptions): Promise<ServiceResponse<string>> {
    try {
      validateCoordinates(options.center.lat, options.center.lng);

      const params = new URLSearchParams({
        key: config.googleMapsApiKey,
        center: `${options.center.lat},${options.center.lng}`,
        zoom: options.zoom.toString(),
        size: `${options.size.width}x${options.size.height}`,
        maptype: options.mapType || 'roadmap',
        scale: '2', // Retina display support
        language: config.defaultLanguage,
      });

      // Add markers if specified
      if (options.markers && options.markers.length > 0) {
        const markerParams = options.markers.map(marker => {
          validateCoordinates(marker.location.lat, marker.location.lng);
          const markerStr = [];
          if (marker.color) markerStr.push(`color:${marker.color}`);
          if (marker.label) markerStr.push(`label:${marker.label}`);
          markerStr.push(`${marker.location.lat},${marker.location.lng}`);
          return markerStr.join('|');
        });
        params.append('markers', markerParams.join('|'));
      }

      // Add path if specified
      if (options.path && options.path.points.length > 0) {
        const pathParams = [];
        if (options.path.color) pathParams.push(`color:${options.path.color}`);
        if (options.path.weight) pathParams.push(`weight:${options.path.weight}`);
        
        const pathPoints = options.path.points.map(point => {
          validateCoordinates(point.lat, point.lng);
          return `${point.lat},${point.lng}`;
        });
        
        pathParams.push(pathPoints.join('|'));
        params.append('path', pathParams.join('|'));
      }

      const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;

      return {
        success: true,
        data: staticMapUrl,
      };
    } catch (error) {
      return handleError(error);
    }
  }
} 