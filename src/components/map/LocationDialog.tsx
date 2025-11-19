import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin } from 'lucide-react';

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lat: number;
  lng: number;
  title?: string;
  address?: string;
}

const LocationDialog: React.FC<LocationDialogProps> = ({
  open,
  onOpenChange,
  lat,
  lng,
  title = 'Location',
  address,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!open) return;

    // Delay to ensure sheet is fully rendered
    const initTimer = setTimeout(() => {
      if (!mapContainer.current || map.current) return;

      try {
        // Initialize map with OpenStreetMap tiles
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: {
            version: 8,
            sources: {
              osm: {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '&copy; OpenStreetMap Contributors',
                maxzoom: 19
              }
            },
            layers: [
              {
                id: 'osm',
                type: 'raster',
                source: 'osm'
              }
            ]
          },
          center: [lng, lat],
          zoom: 16,
        });

        // Add navigation controls
        map.current.addControl(
          new maplibregl.NavigationControl({
            visualizePitch: false,
          }),
          'top-right'
        );

        // Resize map when loaded and add marker
        map.current.on('load', () => {
          if (map.current) {
            map.current.resize();
            
            // Create marker after map is loaded
            marker.current = new maplibregl.Marker({
              color: '#5D866C',
            })
              .setLngLat([lng, lat])
              .addTo(map.current);
          }
        });

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, 400);

    return () => {
      clearTimeout(initTimer);
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [open, lat, lng]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            View the location on OpenStreetMap
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">{address}</p>
                <p className="text-xs text-muted-foreground">
                  {lat.toFixed(6)}, {lng.toFixed(6)}
                </p>
              </div>
            </div>
          )}
          <div className="w-full h-[500px] rounded-lg border overflow-hidden">
            <div ref={mapContainer} className="w-full h-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDialog;
