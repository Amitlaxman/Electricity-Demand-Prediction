'use client';

import * as React from 'react';
import { useMotionValue } from 'framer-motion';

export function useDraggable(initialPosition: {x: number, y: number}, constraintsRef: React.RefObject<HTMLElement>) {
  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);

  // Accept either (event) or (event, info) to be compatible with framer-motion handlers
  const handleDrag = (event: any, _info?: any) => {
    // Normalize to PointerEvent if possible
    const pointerEvent: PointerEvent | null = event && event.nativeEvent && event.nativeEvent instanceof PointerEvent
      ? event.nativeEvent
      : (event as PointerEvent);

    if (!constraintsRef.current || !pointerEvent) return;

    const startX = x.get();
    const startY = y.get();
    const panelElement = event.currentTarget as HTMLElement;
    const panelWidth = panelElement ? panelElement.offsetWidth : 0;
    const panelHeight = panelElement ? panelElement.offsetHeight : 0;

    const onPointerMove = (moveEvent: PointerEvent) => {
        const deltaX = moveEvent.clientX - pointerEvent.clientX;
        const deltaY = moveEvent.clientY - pointerEvent.clientY;

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
