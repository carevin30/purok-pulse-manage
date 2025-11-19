import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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

  // Initialize map when dialog opens
  useEffect(() => {
    if (!open || !mapContainer.current || map.current) return;

    // Wait for dialog animation to complete
    const timer = setTimeout(() => {
      if (!mapContainer.current) return;

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
    }, 350);

    return () => clearTimeout(timer);
  }, [open, lng, lat]);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open && map.current) {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    }
  }, [open]);

  // Update map position when coordinates change (after map is initialized)
  useEffect(() => {
    if (!map.current || !marker.current || !open) return;

    map.current.setCenter([lng, lat]);
    marker.current.setLngLat([lng, lat]);
  }, [lat, lng, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            View the location on the map
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-3 mt-4">
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
          <div className="w-full h-[calc(100vh-200px)] rounded-lg border overflow-hidden">
            <div ref={mapContainer} className="w-full h-full" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LocationDialog;
