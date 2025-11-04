import React, { useEffect, useRef, useState } from 'react';
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
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map when dialog opens
  useEffect(() => {
    if (!open || !mapContainer.current || map.current) return;

    console.log('Dialog opened, initializing map...');
    
    // Wait for dialog animation to complete
    const initTimer = setTimeout(() => {
      if (!mapContainer.current || map.current) return;

      try {
        // Check if container has dimensions
        const rect = mapContainer.current.getBoundingClientRect();
        console.log('Container dimensions:', rect.width, rect.height);
        
        if (rect.width === 0 || rect.height === 0) {
          console.warn('Container has no dimensions');
          setMapError('Container not ready');
          return;
        }

        console.log('Creating map instance...');
        
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

        // Mark as ready when loaded
        map.current.on('load', () => {
          console.log('Map loaded successfully');
          setMapReady(true);
          setMapError(null);
          map.current?.resize();
        });

        map.current.on('error', (e) => {
          console.error('Map error:', e);
          setMapError('Failed to load map');
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map');
      }
    }, 500);

    return () => clearTimeout(initTimer);
  }, [open, lat, lng]);

  // Update map position when coordinates change (if already initialized)
  useEffect(() => {
    if (!mapReady || !map.current || !marker.current) return;

    console.log('Updating map position:', lat, lng);

    try {
      // Update center and marker position
      map.current.flyTo({
        center: [lng, lat],
        zoom: 16,
        duration: 1000,
      });
      
      marker.current.setLngLat([lng, lat]);
      
    } catch (error) {
      console.error('Error updating map:', error);
    }
  }, [lat, lng, mapReady]);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open && map.current) {
      console.log('Dialog closed, cleaning up map...');
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setMapReady(false);
      setMapError(null);
    }
  }, [open]);

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
          <div className="relative w-full h-[400px] rounded-lg border">
            <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
            {!mapReady && !mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            )}
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <p className="text-sm text-destructive">{mapError}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDialog;
