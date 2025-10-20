
'use client';

import React, { useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Stroke, Style, Icon }from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

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
  
  const viewExtent = fromLonLat([68, 8]).concat(fromLonLat([98, 37]));


  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      
      const vectorSource = new VectorSource({
        url: 'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson',
        format: new GeoJSON(),
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
        background: 'transparent',
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
        }),
        controls: [],
      });

      mapInstance.current.on('click', (evt) => {
        const feature = mapInstance.current?.forEachFeatureAtPixel(
          evt.pixel,
          (feature) => {
            if (feature.get('NAME_1')) { 
              return feature;
            }
          },
          {
            layerFilter: (layer) => layer === vectorLayer.current,
          }
        );

        const coords = toLonLat(evt.coordinate);
        const stateName = feature?.get('NAME_1') || 'Unknown';
        onLocationSelect({ lat: coords[1], lng: coords[0], state: stateName });
      });
    }
  }, [onLocationSelect, viewExtent, initialCenter, initialZoom]);

  useEffect(() => {
    if (!mapInstance.current || !vectorLayer.current) return;
    const vectorSource = vectorLayer.current.getSource();
    if (!vectorSource) return;
  
    const highlightStyle = new Style({
      stroke: new Stroke({ color: '#ffa500', width: 2 })
    });
    const defaultStyle = new Style({
      stroke: new Stroke({ color: '#003c88', width: 1 })
    });
  
    // This logic runs when the source has finished loading features.
    const onFeaturesLoadEnd = () => {
        vectorSource.getFeatures().forEach(f => f.setStyle(defaultStyle));
    
        if (selectedState && selectedState !== 'Unknown') {
            const stateFeature = vectorSource.getFeatures().find(f => f.get('NAME_1') === selectedState);
            if (stateFeature) {
                stateFeature.setStyle(highlightStyle);
                const extent = stateFeature.getGeometry()?.getExtent();
                if (extent) {
                    mapInstance.current?.getView().fit(extent, {
                        padding: [50, 50, 50, 50],
                        duration: 1000,
                        maxZoom: 7,
                    });
                }
            }
        } else {
            mapInstance.current?.getView().animate({
                center: initialCenter,
                zoom: initialZoom,
                duration: 1000,
            });
        }
    };

    // Handle already loaded features
    if (vectorSource.getState() === 'ready') {
        onFeaturesLoadEnd();
    } else {
        // Handle features loading for the first time
        vectorSource.on('featuresloadend', onFeaturesLoadEnd);
    }

    // Cleanup listener on component unmount or when source changes
    return () => {
        if(vectorSource.getState() !== 'ready') {
            vectorSource.un('featuresloadend', onFeaturesLoadEnd);
        }
    };

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
