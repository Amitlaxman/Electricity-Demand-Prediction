'use client';

import * as React from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, useMap } from 'react-leaflet';
import type { LatLngExpression, Map } from 'leaflet';
import L from 'leaflet';
import { indiaStatesGeoJSON } from '@/lib/india-states-geojson';

// Fix for default Leaflet icon not showing up
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface IndiaMapProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    state: string;
  }) => void;
  lat: number;
  lon: number;
  selectedState: string | null;
}

const getBoundingBox = (feature: any) => {
  const geo = feature.geometry;
  if (!geo) return null;

  const coords = geo.coordinates;
  const bounds = L.geoJSON(feature).getBounds();
  return bounds;
};

function MapController({ selectedState }: { selectedState: string | null }) {
  const map = useMap();

  React.useEffect(() => {
    if (selectedState) {
      const feature = indiaStatesGeoJSON.features.find(
        (f: any) => f.properties.name === selectedState
      );
      if (feature) {
        const bounds = getBoundingBox(feature);
        if (bounds) {
          map.fitBounds(bounds);
        }
      }
    } else {
      // Zoom out to all of India
      map.fitBounds([[6, 68], [38, 98]]);
    }
  }, [selectedState, map]);

  return null;
}


export function IndiaMap({ onLocationSelect, lat, lon, selectedState }: IndiaMapProps) {
  const [map, setMap] = React.useState<Map | null>(null);

  const onEachFeature = (feature: any, layer: any) => {
    layer.on({
      click: () => {
        onLocationSelect({
          lat: feature.properties.center[1],
          lng: feature.properties.center[0],
          state: feature.properties.name,
        });
      },
    });
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    let stateName = '';
    
    // Naive point-in-polygon check
    const gjLayer = L.geoJSON(indiaStatesGeoJSON);
    gjLayer.eachLayer((layer: any) => {
      if (layer.getBounds().contains(e.latlng)) {
         // This is a simplified check, a real point-in-polygon would be better
         // For MultiPolygons, we'd need to check each polygon.
         // Let's find the feature and check its geometry
        const feature = layer.feature;
        const poly = L.geoJSON(feature);
        
        // This part is tricky with leaflet and complex polygons, we'll do our best
        // for this demo.
        if (stateName === '') { // take the first match
           stateName = feature.properties.name;
        }
      }
    });

    onLocationSelect({ lat, lng, state: stateName || selectedState || 'Unknown' });
  };

  const geoJsonStyle = {
    fillColor: "hsl(var(--primary))",
    fillOpacity: 0.2,
    color: "hsl(var(--primary))",
    weight: 1,
  };
  
  const highlightStyle = {
    fillColor: "hsl(var(--accent))",
    fillOpacity: 0.4,
    color: "hsl(var(--accent))",
    weight: 2,
  };

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: '100%', width: '100%', backgroundColor: 'hsl(var(--background))' }}
      whenCreated={setMap}
      onClick={handleMapClick}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON 
        key={selectedState} // Re-render when selected state changes
        data={indiaStatesGeoJSON as any} 
        onEachFeature={onEachFeature} 
        style={(feature) => {
            return feature?.properties.name === selectedState ? highlightStyle : geoJsonStyle;
        }}
      />
      <Marker position={[lat, lon]} />
      {map && <MapController selectedState={selectedState} />}
    </MapContainer>
  );
}
