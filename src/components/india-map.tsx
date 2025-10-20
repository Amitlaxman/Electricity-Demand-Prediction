
'use client';

import React, { useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Fill, Stroke, Style, Icon } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

import { indiaStatesGeoJSON } from '@/lib/india-states-geojson';

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

export function IndiaMap({ onLocationSelect, lat, lon, selectedState }: IndiaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const vectorLayer = useRef<VectorLayer<any> | null>(null);
  const markerLayer = useRef<VectorLayer<any> | null>(null);

  const initialCenter = fromLonLat([82.7, 23.5]);
  const initialZoom = 4.5;
  const viewExtent = fromLonLat([68, 6]).concat(fromLonLat([98, 37]));


  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      const geoJsonFormat = new GeoJSON({
        featureProjection: 'EPSG:3857',
      });

      const vectorSource = new VectorSource({
        features: geoJsonFormat.readFeatures(indiaStatesGeoJSON),
      });

      const defaultStyle = new Style({
        stroke: new Stroke({
          color: '#003c88',
          width: 1,
        }),
      });

      vectorLayer.current = new VectorLayer({
        source: vectorSource,
        style: defaultStyle,
      });

      const markerSource = new VectorSource();
      markerLayer.current = new VectorLayer({
        source: markerSource,
        style: new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            scale: 0.8,
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
          }),
        }),
      });
      
      mapInstance.current = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          vectorLayer.current,
          markerLayer.current,
        ],
        view: new View({
          center: initialCenter,
          zoom: initialZoom,
          extent: viewExtent,
          constrainOnlyCenter: true,
        }),
        controls: [],
      });

      mapInstance.current.on('click', (evt) => {
        const feature = mapInstance.current?.forEachFeatureAtPixel(
          evt.pixel,
          (feature) => {
            if (feature.get('name')) { // Ensure it's a state feature
              return feature;
            }
          }
        );

        const coords = toLonLat(evt.coordinate);
        const stateName = feature?.get('name') || selectedState || 'Unknown';
        onLocationSelect({ lat: coords[1], lng: coords[0], state: stateName });
      });
    }
  }, [onLocationSelect, selectedState, initialCenter, viewExtent]);

  useEffect(() => {
    if (mapInstance.current && selectedState) {
        const vectorSource = vectorLayer.current?.getSource();
        const highlightStyle = new Style({
            fill: new Fill({
              color: 'rgba(255, 165, 0, 0.4)',
            }),
            stroke: new Stroke({
              color: '#ffa500',
              width: 2,
            }),
          });
        const defaultStyle = new Style({
            stroke: new Stroke({
              color: '#003c88',
              width: 1,
            }),
        });

        vectorSource?.getFeatures().forEach(feature => {
            if (feature.get('name') === selectedState) {
                feature.setStyle(highlightStyle);
                const extent = feature.getGeometry()?.getExtent();
                if (extent) {
                    mapInstance.current?.getView().fit(extent, {
                        padding: [50, 50, 50, 50],
                        duration: 1000,
                        maxZoom: 6,
                    });
                }
            } else {
                feature.setStyle(defaultStyle);
            }
        });
    } else if (mapInstance.current) {
        const defaultStyle = new Style({
            stroke: new Stroke({
              color: '#003c88',
              width: 1,
            }),
        });
        vectorLayer.current?.getSource()?.getFeatures().forEach(feature => {
            feature.setStyle(defaultStyle);
        });
        mapInstance.current?.getView().animate({
            center: initialCenter,
            zoom: initialZoom,
            duration: 1000
        });
    }
  }, [selectedState, initialCenter, initialZoom]);

  useEffect(() => {
    if (markerLayer.current) {
      const markerSource = markerLayer.current.getSource();
      markerSource.clear();
      const marker = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
      });
      markerSource.addFeature(marker);
    }
    
  }, [lat, lon]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
}
