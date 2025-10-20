'use client';

import * as React from 'react';
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

export function IndiaMap({ onLocationSelect, lat, lon }: IndiaMapProps) {
  // A robust hardcoded viewBox that fits the map of India
  const viewBox = "68 6 30 32";

  const handleStateClick = (stateName: string, center: [number, number], e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the main map click from firing
    onLocationSelect({ lat: center[1], lng: center[0], state: stateName });
  };
  
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const transformedPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
    
    // Adjust for the SVG transform
    const correctedY = 44 - transformedPoint.y;

    // Determine which state was clicked, or default to "Unknown"
    let stateName = "Unknown";
    const targetPath = e.target as SVGPathElement;
    if (targetPath.dataset.name) {
      stateName = targetPath.dataset.name;
    }
    
    onLocationSelect({
      lat: correctedY,
      lng: transformedPoint.x,
      state: stateName,
    });
  };

  const createPath = (geometry: any) => {
    const { type, coordinates } = geometry;
    if (type === 'Polygon') {
      return coordinates
        .map((ring: any) => `M ${ring.map((p: number[]) => p.join(',')).join(' L ')} Z`)
        .join(' ');
    } else if (type === 'MultiPolygon') {
      return coordinates
        .map((polygon: any) =>
          polygon
            .map((ring: any) => `M ${ring.map((p: number[]) => p.join(',')).join(' L ')} Z`)
            .join(' ')
        )
        .join(' ');
    }
    return '';
  };


  return (
    <div className="h-full w-full bg-primary/10">
        <svg
            viewBox={viewBox}
            className="h-full w-full cursor-pointer"
            onClick={handleMapClick}
        >
            <g transform="scale(1, -1) translate(0, -44)">
            {indiaStatesGeoJSON.features.map(feature => (
                <path
                key={feature.properties.name}
                data-name={feature.properties.name}
                d={createPath(feature.geometry)}
                className="fill-primary/20 stroke-primary/80 transition-all hover:fill-primary/40"
                strokeWidth="0.1"
                onClick={(e) =>
                    handleStateClick(
                    feature.properties.name,
                    feature.properties.center,
                    e
                    )
                }
                />
            ))}
            </g>
            <g>
                <path
                    d="M10 2.5a7.5 7.5 0 0 1 7.5 7.5c0 4.142-7.5 11.25-7.5 11.25S2.5 14.142 2.5 10A7.5 7.5 0 0 1 10 2.5z"
                    fill="hsl(var(--primary))"
                    stroke="hsl(var(--primary-foreground))"
                    strokeWidth="0.5"
                    transform={`translate(${lon - 1.25}, ${lat - 3}) scale(0.25)`}
                />
                <circle 
                    cx={lon} 
                    cy={lat} 
                    r="0.5" 
                    fill="hsl(var(--primary-foreground))"
                    transform={`translate(0, -0.6)`}
                />
            </g>
      </svg>
    </div>
  );
}
