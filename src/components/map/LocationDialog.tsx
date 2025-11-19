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

  // Initialize map ONLY when dialog is open
  useEffect(() => {
    if (!open || !mapContainer.current) return;

    // Wait for dialog to be fully rendered
    const initTimer = setTimeout(() => {
      if (!mapContainer.current || map.current) return;

      try {
        // Initialize map
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: 'https://tiles.openfreemap.org/styles/liberty',
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

        // Create marker
        marker.current = new maplibregl.Marker({
          color: '#5D866C',
        })
          .setLngLat([lng, lat])
          .addTo(map.current);

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, 100);

    // Cleanup when dialog closes
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            View the location on the map
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
          <div className="w-full h-[400px] rounded-lg border overflow-hidden">
            <div ref={mapContainer} className="w-full h-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDialog;
