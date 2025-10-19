'use client';

import * as React from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  useMap,
} from '@vis.gl/react-google-maps';
import { indiaStatesGeoJSON } from '@/lib/india-states-geojson';

interface IndiaMapProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    state: string;
  }) => void;
  lat: number;
  lon: number;
}

const Polygon = (props: google.maps.PolygonOptions) => {
  const map = useMap();
  const [polygon, setPolygon] = React.useState<google.maps.Polygon | null>(null);

  React.useEffect(() => {
    if (map) {
      const p = new google.maps.Polygon(props);
      p.setMap(map);
      setPolygon(p);
      return () => {
        p.setMap(null);
      };
    }
  }, [map, props]);

  return null;
};


export function IndiaMap({ onLocationSelect, lat, lon }: IndiaMapProps) {
  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const handleStateClick = (stateName: string, center: [number, number]) => {
    onLocationSelect({ lat: center[1], lng: center[0], state: stateName });
    if(map) map.panTo({ lat: center[1], lng: center[0] });
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const { lat, lng } = e.latLng;
      const point = new google.maps.LatLng(lat(), lng());
      let selectedState = 'Unknown';

      for (const feature of indiaStatesGeoJSON.features) {
        const polygonCoords = feature.geometry.coordinates[0][0].map(
          (coord: number[]) => new google.maps.LatLng(coord[1], coord[0])
        );
        const polygon = new google.maps.Polygon({ paths: polygonCoords });
        if (google.maps.geometry.poly.containsLocation(point, polygon)) {
          selectedState = feature.properties.name;
          break;
        }
      }
      onLocationSelect({ lat: lat(), lng: lng(), state: selectedState });
    }
  };

  return (
    <div className="h-full w-full">
      <Map
        ref={setMap}
        style={{ width: '100%', height: '100%' }}
        defaultCenter={{ lat: 20.5937, lng: 78.9629 }}
        defaultZoom={4.5}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId={'a2f3bdeec493efe'}
        onClick={handleMapClick}
      >
        <AdvancedMarker position={{ lat, lng }}>
          <Pin
            background={'hsl(var(--primary))'}
            borderColor={'hsl(var(--primary-foreground))'}
            glyphColor={'hsl(var(--primary-foreground))'}
          />
        </AdvancedMarker>

        {indiaStatesGeoJSON.features.map((feature) => (
          <Polygon
            key={feature.properties.name}
            paths={feature.geometry.coordinates[0].map(ring => ring.map(coord => ({lat: coord[1], lng: coord[0]})))}
            onClick={() =>
              handleStateClick(
                feature.properties.name,
                feature.properties.center
              )
            }
            strokeColor={'hsl(var(--primary))'}
            strokeOpacity={0.8}
            strokeWeight={1}
            fillColor={'hsl(var(--primary))'}
            fillOpacity={0.2}
          />
        ))}
      </Map>
    </div>
  );
}
