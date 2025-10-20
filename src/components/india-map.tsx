'use client';

import * as React from 'react';
import { RefreshCw } from 'lucide-react';
import { indiaStatesGeoJSON } from '@/lib/india-states-geojson';
import { Button } from '@/components/ui/button';

interface IndiaMapProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    state: string;
  }) => void;
  lat: number;
  lon: number;
}

const INITIAL_VIEWBOX = "68 6 30 32";

// Helper to calculate the bounding box of a geometry
const getBoundingBox = (geometry: any) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    const processCoordinates = (coords: any[]) => {
        for (const p of coords) {
            if (Array.isArray(p[0])) {
                processCoordinates(p);
            } else {
                const [x, y] = p;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    };

    if (geometry.type === 'Polygon') {
        geometry.coordinates.forEach(processCoordinates);
    } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach((poly: any) => poly.forEach(processCoordinates));
    }

    return { minX, minY, maxX, maxY };
};


export function IndiaMap({ onLocationSelect, lat, lon }: IndiaMapProps) {
  const [viewBox, setViewBox] = React.useState(INITIAL_VIEWBOX);
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [selectedState, setSelectedState] = React.useState<string | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);

  const handleStateClick = (feature: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const { name, center } = feature.properties;
    
    if (selectedState === name) {
        // If already zoomed in on this state, handle as a map click for precise location
        handleMapClick(e);
        return;
    }

    setSelectedState(name);
    
    // Calculate bounding box and set new viewBox for zoom
    const bbox = getBoundingBox(feature.geometry);
    const padding = 1; // Add some padding around the state
    const width = bbox.maxX - bbox.minX + padding * 2;
    const height = bbox.maxY - bbox.minY + padding * 2;
    
    if (width > 0 && height > 0) {
      const newViewBox = `${bbox.minX - padding} ${bbox.minY - padding} ${width} ${height}`;
      setViewBox(newViewBox);
      setIsZoomed(true);
    }
    
    onLocationSelect({ lat: center[1], lng: center[0], state: name });
  };
  
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const transformedPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
    
    let stateName = selectedState || "Unknown";
    const targetPath = e.target as SVGPathElement;
    if (targetPath.dataset.name) {
      stateName = targetPath.dataset.name;
    }
    
    onLocationSelect({
      lat: transformedPoint.y,
      lng: transformedPoint.x,
      state: stateName,
    });
  };

  const createPath = (geometry: any) => {
    const { type, coordinates } = geometry;
    if (!coordinates || coordinates.length === 0) return '';
    
    try {
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
    } catch (error) {
      console.error("Error creating path: ", error, " for geometry: ", geometry);
      return "";
    }
    return '';
  };
  
  const resetView = () => {
    setViewBox(INITIAL_VIEWBOX);
    setIsZoomed(false);
    setSelectedState(null);
  }

  const pinScale = isZoomed ? 0.05 : 0.25;

  return (
    <div className="relative h-full w-full bg-primary/10">
        {isZoomed && (
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-card/50 hover:bg-card"
                onClick={resetView}
            >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Reset View</span>
            </Button>
        )}
        <svg
            ref={svgRef}
            viewBox={viewBox}
            className="h-full w-full cursor-pointer transition-all duration-500"
            onClick={isZoomed ? handleMapClick : (e) => e.stopPropagation()}
        >
            <g transform="scale(1, -1) translate(0, -38)">
                {indiaStatesGeoJSON.features.map((feature: any) => (
                    <path
                    key={feature.properties.name}
                    data-name={feature.properties.name}
                    d={createPath(feature.geometry)}
                    className="fill-primary/20 stroke-primary/80 transition-all hover:fill-primary/40"
                    strokeWidth="0.1"
                    vectorEffect="non-scaling-stroke"
                    onClick={(e) => handleStateClick(feature, e)}
                    />
                ))}
                <g>
                    <g transform={`translate(${lon}, ${lat}) scale(${pinScale}) translate(-10, -22.5)`}>
                      <path
                          d="M10 2.5a7.5 7.5 0 0 1 7.5 7.5c0 4.142-7.5 11.25-7.5 11.25S2.5 14.142 2.5 10A7.5 7.5 0 0 1 10 2.5z"
                          fill="hsl(var(--primary))"
                          stroke="hsl(var(--primary-foreground))"
                          strokeWidth={1 / pinScale}
                          transform="scale(1, -1) translate(0, -22.5)"
                      />
                      <circle 
                          cx="10" 
                          cy="10" 
                          r="2.5"
                          fill="hsl(var(--primary-foreground))"
                          transform="scale(1, -1) translate(0, -20)"
                      />
                    </g>
                </g>
            </g>
      </svg>
    </div>
  );
}