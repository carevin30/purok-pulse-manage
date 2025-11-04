import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Dialog,
  DialogContent,
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
    if (!open || !mapContainer.current) return;

    // Clean up existing map
    if (map.current) {
      marker.current?.remove();
      map.current.remove();
      map.current = null;
    }

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'openfreemap': {
            type: 'raster',
            tiles: ['https://tiles.openfreemap.org/styles/liberty/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenFreeMap contributors'
          }
        },
        layers: [
          {
            id: 'openfreemap-layer',
            type: 'raster',
            source: 'openfreemap',
            minzoom: 0,
            maxzoom: 19
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
  }, [open, lat, lng]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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
          <div ref={mapContainer} className="w-full h-[400px] rounded-lg border" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDialog;
