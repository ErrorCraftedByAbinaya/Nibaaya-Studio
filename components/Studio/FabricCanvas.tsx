'use client';

import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useStudio } from '@/hooks/useStudioState';
import { useFabricCanvas } from '@/hooks/useFabricCanvas';
import type { FabricCanvasHandle } from '@/lib/types';

const FabricCanvas = forwardRef<FabricCanvasHandle>((_, ref) => {
  const { state, dispatch, isNeckLabelEnabled } = useStudio();
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const canvasApi = useFabricCanvas(canvasRef, containerRef, state, (patch) => {
    dispatch({ type: 'SET_ARTWORK_TRANSFORM', patch });
  });

  useImperativeHandle(ref, () => canvasApi, [canvasApi]);

  const views = isNeckLabelEnabled ? ['front', 'neck', 'back'] : ['front', 'back'];

  return (
    <div className="canvas-container" ref={containerRef}>
      <canvas ref={canvasRef} />
      <div className="view-toggles-wrapper">
        <div className="view-toggles">
          {views.map((v) => (
            <button
              key={v}
              className={[
                state.activeView === v ? 'active' : '',
                state.artworks[v as keyof typeof state.artworks] ? 'has-art' : '',
              ].join(' ')}
              onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', view: v as 'front' | 'neck' | 'back' })}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
              {state.artworks[v as keyof typeof state.artworks] && (
                <span className="toggle-dot" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

FabricCanvas.displayName = 'FabricCanvas';
export default FabricCanvas;
