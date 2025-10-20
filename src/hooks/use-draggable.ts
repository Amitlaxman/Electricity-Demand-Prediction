'use client';

import * as React from 'react';
import { useMotionValue } from 'framer-motion';

export function useDraggable(initialPosition: {x: number, y: number}, constraintsRef: React.RefObject<HTMLElement>) {
  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);

  const handleDrag = (event: React.PointerEvent) => {
    if (!constraintsRef.current) return;
    
    const startX = x.get();
    const startY = y.get();
    const panelElement = event.currentTarget as HTMLElement;
    const panelWidth = panelElement.offsetWidth;
    const panelHeight = panelElement.offsetHeight;


    const onPointerMove = (moveEvent: PointerEvent) => {
        const deltaX = moveEvent.clientX - event.clientX;
        const deltaY = moveEvent.clientY - event.clientY;

        const { width, height } = constraintsRef.current!.getBoundingClientRect();
        
        const newX = Math.min(Math.max(startX + deltaX, 0), width - panelWidth);
        const newY = Math.min(Math.max(startY + deltaY, 0), height - panelHeight);

        x.set(newX);
        y.set(newY);
    };

    const onPointerUp = () => {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };
  
  return {
    position: { x, y },
    handleDrag,
  };
}
