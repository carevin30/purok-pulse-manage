import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  readonly?: boolean;
}

const MapPicker: React.FC<MapPickerProps> = ({
  initialLat = 17.65,
  initialLng = 120.85,
  onLocationSelect,
  readonly = false,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const [coordinates, setCoordinates] = useState({ lat: initialLat, lng: initialLng });

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

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
      center: [initialLng, initialLat],
      zoom: 15,
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
      draggable: !readonly,
    })
      .setLngLat([initialLng, initialLat])
      .addTo(map.current);

    // Handle marker drag
    if (!readonly && marker.current) {
      marker.current.on('dragend', () => {
        const lngLat = marker.current!.getLngLat();
        setCoordinates({ lat: lngLat.lat, lng: lngLat.lng });
        onLocationSelect(lngLat.lat, lngLat.lng);
      });
    }

    // Handle map click
    if (!readonly) {
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        marker.current?.setLngLat([lng, lat]);
        setCoordinates({ lat, lng });
        onLocationSelect(lat, lng);
      });
    }

    return () => {
      marker.current?.remove();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div className="space-y-2">
      <div ref={mapContainer} className="w-full h-[300px] rounded-lg border" />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>
            {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </span>
        </div>
        {!readonly && (
          <span className="text-xs">Click map or drag marker to select location</span>
        )}
      </div>
    </div>
  );
};

export default MapPicker;
