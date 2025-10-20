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

// Function to calculate the bounding box of all states
const getBoundingBox = (features: any[]) => {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  features.forEach(feature => {
    feature.geometry.coordinates[0][0].forEach((coord: number[]) => {
      const [x, y] = coord;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });
  });

  return { minX, minY, maxX, maxY };
};

export function IndiaMap({ onLocationSelect, lat, lon }: IndiaMapProps) {
  const boundingBox = getBoundingBox(indiaStatesGeoJSON.features);
  const viewBox = `${boundingBox.minX - 2} ${boundingBox.minY - 12} ${
    boundingBox.maxX - boundingBox.minX + 5
  } ${boundingBox.maxY - boundingBox.minY + 15}`;

  const handleStateClick = (stateName: string, center: [number, number]) => {
    onLocationSelect({ lat: center[1], lng: center[0], state: stateName });
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const transformedPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
  
    let selectedState = 'Unknown';
    let clickedPath = e.target as SVGPathElement;
  
    if (clickedPath.tagName === 'path' && clickedPath.dataset.name) {
      selectedState = clickedPath.dataset.name;
    }
  
    onLocationSelect({
      lat: transformedPoint.y,
      lng: transformedPoint.x,
      state: selectedState,
    });
  };

  const projectToSvg = (lat: number, lon: number) => {
    return { x: lon, y: lat };
  };
  
  const pinPosition = projectToSvg(lat, lon);

  return (
    <div className="h-full w-full">
      <svg
        viewBox={viewBox}
        className="h-full w-full cursor-pointer"
        onClick={handleMapClick}
      >
        <g>
          {indiaStatesGeoJSON.features.map(feature => (
            <path
              key={feature.properties.name}
              data-name={feature.properties.name}
              d={`M${feature.geometry.coordinates[0][0].join('L')}`}
              className="fill-primary/20 stroke-primary/80 transition-all hover:fill-primary/40"
              strokeWidth="0.1"
              onClick={e => {
                e.stopPropagation();
                handleStateClick(
                  feature.properties.name,
                  feature.properties.center
                );
              }}
            />
          ))}
        </g>
        <g>
          <path
            d="M10 2.5a7.5 7.5 0 0 1 7.5 7.5c0 4.142-7.5 11.25-7.5 11.25S2.5 14.142 2.5 10A7.5 7.5 0 0 1 10 2.5z"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="0.5"
            transform={`translate(${pinPosition.x - 1.25}, ${pinPosition.y - 3}) scale(0.25)`}
          />
          <circle 
            cx={pinPosition.x} 
            cy={pinPosition.y} 
            r="0.5" 
            fill="hsl(var(--primary-foreground))"
            transform={`translate(-0, -0.6)`}
          />
        </g>
      </svg>
    </div>
  );
}
