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

  // Initialize map once on mount - exactly like MapPicker
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

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

    return () => {
      marker.current?.remove();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map position when coordinates change or when sheet opens
  useEffect(() => {
    if (!map.current || !marker.current) return;

    // Resize map when sheet opens to ensure proper dimensions
    if (open) {
      setTimeout(() => {
        map.current?.resize();
        map.current?.setCenter([lng, lat]);
        marker.current?.setLngLat([lng, lat]);
      }, 350);
    }
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
