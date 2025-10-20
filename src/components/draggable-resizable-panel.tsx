'use client';

import * as React from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Maximize, Minimize, Minimize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDraggable } from '@/hooks/use-draggable';
import { GripVertical } from '@/components/icons';
import { Button } from './ui/button';

interface DraggableResizablePanelProps {
  children: React.ReactNode;
  className?: string;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number | string; height: number | string };
  title?: string;
}

export function DraggableResizablePanel({
  children,
  className,
  initialPosition = { x: 0, y: 0 },
  initialSize = { width: 500, height: 300 },
  title = 'Panel',
}: DraggableResizablePanelProps) {
  const constraintsRef = React.useRef<HTMLDivElement>(null);
  const { position, handleDrag } = useDraggable(initialPosition, constraintsRef);
  const [size, setSize] = React.useState(initialSize);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [isClosed, setIsClosed] = React.useState(false);

  const handleResize = (
    e: React.PointerEvent<HTMLDivElement>,
    direction: 'bottom' | 'right' | 'bottom-right'
  ) => {
    const startSize = { width: parseFloat(size.width.toString()), height: parseFloat(size.height.toString()) };
    const startPosition = { x: e.clientX, y: e.clientY };

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startPosition.x;
      const dy = moveEvent.clientY - startPosition.y;
      
      let newWidth = size.width;
      let newHeight = size.height;

      if (direction.includes('right')) {
        newWidth = startSize.width + dx;
      }
      if (direction.includes('bottom')) {
        newHeight = startSize.height + dy;
      }
      
      setSize({ width: Math.max(newWidth, 200), height: Math.max(newHeight, 150) });
    };

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };
  
  if (isClosed) return null;

  return (
    <motion.div
      ref={constraintsRef}
      className="absolute inset-0 pointer-events-none"
    >
      <motion.div
        drag
        dragListener={false} // We use our own drag handler on the header
        onDrag={handleDrag}
        dragMomentum={false}
        style={{ x: position.x, y: position.y }}
        className={cn(
          'pointer-events-auto flex flex-col rounded-lg border bg-card text-card-foreground shadow-xl',
          className
        )}
        animate={{ width: size.width, height: isMinimized ? 'auto' : size.height }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <header
          onPointerDown={(e) => {
            // Only allow dragging from the header itself, not buttons
            if (e.target === e.currentTarget) {
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                handleDrag(e, {} as PanInfo);
            }
          }}
          className="flex items-center justify-between px-3 py-2 border-b rounded-t-lg cursor-grab active:cursor-grabbing bg-muted/50"
        >
          <span className="font-semibold text-sm">{title}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? <Maximize className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsClosed(true)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {!isMinimized && (
          <div className="flex-1 overflow-auto p-4 relative">
            {children}
            <div
              className="absolute bottom-0 right-0 cursor-nwse-resize p-2 text-muted-foreground"
              onPointerDown={(e) => handleResize(e, 'bottom-right')}
            >
                <GripVertical className="h-4 w-4" />
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
