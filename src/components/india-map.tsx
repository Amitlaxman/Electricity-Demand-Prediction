'use client';

import * as React from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, useMap } from 'react-leaflet';
import type { Map } from 'leaflet';
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
  if (!feature) return null;
  return L.geoJSON(feature).getBounds();
};

function MapController({ selectedState, lat, lon }: { selectedState: string | null, lat: number, lon: number }) {
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
      map.setView([20.5937, 78.9629], 5);
    }
  }, [selectedState, map]);

  React.useEffect(() => {
    // This effect is to move the marker when lat/lon props change,
    // but without re-fitting the bounds unless the state changes.
    // We only pan to the new marker if it's outside the current view.
    const markerLatLng = L.latLng(lat, lon);
    if (!map.getBounds().contains(markerLatLng)) {
        map.panTo(markerLatLng);
    }
  }, [lat, lon, map]);

  return null;
}


export function IndiaMap({ onLocationSelect, lat, lon, selectedState }: IndiaMapProps) {

  const onEachFeature = (feature: any, layer: any) => {
    layer.on({
      click: (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e); // Prevent map click event from firing
        onLocationSelect({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          state: feature.properties.name,
        });
      },
    });
  };

  const MapClickHandler = () => {
    const map = useMap();
    React.useEffect(() => {
      const handler = (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        let stateName = '';
        
        const gjLayer = L.geoJSON(indiaStatesGeoJSON);
        gjLayer.eachLayer((layer: any) => {
          const feature = layer.feature;
          const poly = L.geoJSON(feature);
          // A proper point-in-polygon check would be better here.
          // For this demo, we can use a library if needed, or rely on the onEachFeature click.
          // For now, we find the containing bounds.
          if (poly.getBounds().contains(e.latlng)) {
            stateName = feature.properties.name;
          }
        });

        onLocationSelect({ lat, lng, state: stateName || selectedState || 'Unknown' });
      }
      map.on('click', handler);

      return () => {
        map.off('click', handler);
      }
    }, [map]);

    return null;
  }

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
      scrollWheelZoom={true}
      key="india-map-container"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON 
        key={selectedState} // Re-render when selected state changes to apply style
        data={indiaStatesGeoJSON as any} 
        onEachFeature={onEachFeature} 
        style={(feature) => {
            return feature?.properties.name === selectedState ? highlightStyle : geoJsonStyle;
        }}
      />
      <Marker position={[lat, lon]} />
      <MapController selectedState={selectedState} lat={lat} lon={lon} />
      <MapClickHandler />
    </MapContainer>
  );
}
