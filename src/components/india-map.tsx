'use client';

import * as React from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, useMap, useMapEvents } from 'react-leaflet';
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
    const markerLatLng = L.latLng(lat, lon);
    // Don't pan if the state is selected, as fitBounds is already handling the view.
    if (!selectedState && !map.getBounds().contains(markerLatLng)) {
        map.panTo(markerLatLng);
    }
  }, [lat, lon, map, selectedState]);


  return null;
}


export function IndiaMap({ onLocationSelect, lat, lon, selectedState }: IndiaMapProps) {

  const onEachFeature = (feature: any, layer: any) => {
    layer.on({
      click: (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e); 
        onLocationSelect({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          state: feature.properties.name,
        });
      },
    });
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        let stateName = '';
        
        // This is a simplified check. A proper point-in-polygon check would be more robust.
        const gjLayer = L.geoJSON(indiaStatesGeoJSON);
        gjLayer.eachLayer((layer: any) => {
            if (layer.getBounds().contains(e.latlng)) {
                if (stateName === '') { // Prioritize the first match
                    stateName = layer.feature.properties.name;
                }
            }
        });

        onLocationSelect({ lat, lng, state: stateName || selectedState || 'Unknown' });
      }
    });

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
      key="india-map-container"
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: '100%', width: '100%', backgroundColor: 'hsl(var(--background))' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON 
        key={selectedState} 
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
