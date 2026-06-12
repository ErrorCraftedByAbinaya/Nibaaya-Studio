'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import FabricCanvas   from './FabricCanvas';
import FilterModal    from './FilterModal';
import GarmentColour  from './GarmentColour';
import NeckLabel      from './NeckLabel';
import ArtworkPanel   from './ArtworkPanel';
import PriceSummary   from './PriceSummary';
import { useStudio }  from '@/hooks/useStudioState';
import { useArtworkBridge } from '@/hooks/useArtworkBridge';
import type { FabricCanvasHandle, StudioProduct } from '@/lib/types';

type Panel = 'color' | 'artwork' | 'neckLabel' | null;

export default function StudioApp({ product }: { product?: StudioProduct | null }) {
  const { state, dispatch, isNeckLabelEnabled } = useStudio();
  const fabricRef   = useRef<FabricCanvasHandle>(null);
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [isMobile,    setIsMobile]    = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close neck label panel if it becomes unavailable
  useEffect(() => {
    if (!isNeckLabelEnabled) {
      if (activePanel === 'neckLabel') setActivePanel(null);
      if (state.activeView === 'neck') dispatch({ type: 'SET_ACTIVE_VIEW', view: 'front' });
    }
  }, [isNeckLabelEnabled]);

  const {
    handleArtworkUpload, handleArtworkRemove, handleArtworkAlign,
    handleArtworkUpdateTransform, handleLeftChestUpload, handleLeftChestRemove,
  } = useArtworkBridge(fabricRef);

  const currentColorHex = useMemo(() => {
    if (state.garmentColor === '__custom__') return state.customColorHex;
    return state.signatureColors.find((c) => c.name === state.garmentColor)?.hex ?? '#ffffff';
  }, [state.garmentColor, state.customColorHex, state.signatureColors]);

  const currentViewHasArtwork = !!state.artworks[state.activeView as keyof typeof state.artworks];

  const togglePanel = (name: Panel) => {
    if (name === 'neckLabel' && !isNeckLabelEnabled) return;
    const isOpening = activePanel !== name;
    setActivePanel(isOpening ? name : null);
    if (name === 'neckLabel') {
      dispatch({ type: 'SET_ACTIVE_VIEW', view: isOpening ? 'neck' : 'front' });
    }
  };

  const backHref = product ? `/products/${product.slug}` : '/';

  return (
    <div className="app-container">

      {/* Desktop header */}
      <header className="app-header">
        <div className="product-info">{state.productName}</div>
        <div className="logo"><strong>Nibaaya</strong> Studio</div>
        <div className="actions">
          <Link href={backHref} className="btn-text back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </Link>
        </div>
      </header>

      <main className="workspace">
        <div className="canvas-section">
          <FabricCanvas ref={fabricRef} />

          {/* Mobile floating nav */}
          <div className="canvas-nav">
            <Link href={backHref} className="canvas-nav-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </Link>
            <div className="canvas-nav-logo"><strong>Nibaaya</strong> Studio</div>
            <button className="canvas-nav-btn">Share</button>
          </div>
        </div>

        {/* Mobile backdrop */}
        {activePanel && !(activePanel === 'color' && isMobile) && (
          <div className="mobile-backdrop" onClick={() => setActivePanel(null)} />
        )}

        {/* Mobile dock */}
        <div className="mobile-dock">
          <button className="dock-btn" onClick={() => dispatch({ type: 'SET_FILTER_MODAL', open: true })}>
            <div className="dock-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <span className="dock-label">Filter</span>
          </button>

          <button
            className={`dock-btn${activePanel === 'color' ? ' dock-btn--active' : ''}`}
            onClick={() => togglePanel('color')}
          >
            <div className="dock-icon">
              <span className="dock-color-dot" style={{ background: currentColorHex }} />
            </div>
            <span className="dock-label">Colour</span>
          </button>

          <button
            className={`dock-btn${activePanel === 'artwork' ? ' dock-btn--active' : ''}`}
            onClick={() => togglePanel('artwork')}
          >
            <div className="dock-icon dock-icon--rel">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {currentViewHasArtwork && <span className="dock-badge" />}
            </div>
            <span className="dock-label">Artwork</span>
          </button>

          <button
            className={`dock-btn${activePanel === 'neckLabel' ? ' dock-btn--active' : ''}${!isNeckLabelEnabled ? ' dock-btn--disabled' : ''}`}
            disabled={!isNeckLabelEnabled}
            onClick={() => togglePanel('neckLabel')}
          >
            <div className="dock-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <span className="dock-label">Label</span>
          </button>
        </div>

        {/* Mobile artwork align row */}
        {activePanel === 'artwork' && currentViewHasArtwork && isMobile && (
          <div className="dock-align-row">
            <div className="dal-group">
              {['left', 'center', 'right'].map((dir) => (
                <button key={dir} className="dal-btn" onClick={() => handleArtworkAlign(dir)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    {dir === 'left'   && <><path stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" d="M1.6.8v14.4"/><path fill="currentColor" d="M4 10a.8.8 0 0 1 .8-.8H14a.8.8 0 0 1 .8.8v1.2a.8.8 0 0 1-.8.8H4.8a.8.8 0 0 1-.8-.8zM12 6a.8.8 0 0 1-.8.8H4.8A.8.8 0 0 1 4 6V4.8a.8.8 0 0 1 .8-.8h6.4a.8.8 0 0 1 .8.8z"/></>}
                    {dir === 'center' && <><path stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" d="M8 .8v14.4"/><path fill="currentColor" d="M2 4.8a.8.8 0 0 1 .8-.8h10.4a.8.8 0 0 1 .8.8V6a.8.8 0 0 1-.8.8H2.8A.8.8 0 0 1 2 6zM12 11.2a.8.8 0 0 1-.8.8H4.8a.8.8 0 0 1-.8-.8V10a.8.8 0 0 1 .8-.8h6.4a.8.8 0 0 1 .8.8z"/></>}
                    {dir === 'right'  && <><path stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" d="M14.4.8v14.4"/><path fill="currentColor" d="M1.2 10a.8.8 0 0 1 .8-.8h9.2a.8.8 0 0 1 .8.8v1.2a.8.8 0 0 1-.8.8H2a.8.8 0 0 1-.8-.8zM12 6a.8.8 0 0 1-.8.8H4.8A.8.8 0 0 1 4 6V4.8a.8.8 0 0 1 .8-.8h6.4a.8.8 0 0 1 .8.8z"/></>}
                  </svg>
                </button>
              ))}
            </div>
            <div className="dal-sep" />
            <div className="dal-group">
              {['top', 'middle', 'bottom'].map((dir) => (
                <button key={dir} className="dal-btn" onClick={() => handleArtworkAlign(dir)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    {dir === 'top'    && <><path stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" d="M15.2 1.6H.8"/><path fill="currentColor" d="M4.8 14.8A.8.8 0 0 1 4 14V4.8a.8.8 0 0 1 .8-.8H6a.8.8 0 0 1 .8.8V14a.8.8 0 0 1-.8.8zM11.2 4a.8.8 0 0 1 .8.8v6.4a.8.8 0 0 1-.8.8H10a.8.8 0 0 1-.8-.8V4.8A.8.8 0 0 1 10 4z"/></>}
                    {dir === 'middle' && <><path stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" d="M15.2 8H.8"/><path fill="currentColor" d="M4.8 14a.8.8 0 0 1-.8-.8V2.8a.8.8 0 0 1 .8-.8H6a.8.8 0 0 1 .8.8v10.4a.8.8 0 0 1-.8.8zM11.2 4a.8.8 0 0 1 .8.8v6.4a.8.8 0 0 1-.8.8H10a.8.8 0 0 1-.8-.8V4.8A.8.8 0 0 1 10 4z"/></>}
                    {dir === 'bottom' && <><path stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" d="M15.2 14.4H.8"/><path fill="currentColor" d="M4.8 12a.8.8 0 0 1-.8-.8V2a.8.8 0 0 1 .8-.8H6a.8.8 0 0 1 .8.8v9.2a.8.8 0 0 1-.8.8zM11.2 4a.8.8 0 0 1 .8.8v6.4a.8.8 0 0 1-.8.8H10a.8.8 0 0 1-.8-.8V4.8A.8.8 0 0 1 10 4z"/></>}
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sidebar (desktop) / bottom sheet host (mobile) */}
        <aside className="sidebar">
          {/* Customization Filter */}
          <div className="sidebar-panel" onClick={() => dispatch({ type: 'SET_FILTER_MODAL', open: true })}>
            <div className="panel-header">
              <h3>Customization Filter</h3>
              <div className="icon-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>
            </div>
            <div className="panel-meta">
              <span className="meta-chip">{state.quantity} Units</span>
              <span className="meta-chip">{state.deliverySpeed}</span>
            </div>
          </div>

          {/* Garment Colour */}
          <div className={`sidebar-panel${activePanel === 'color' && !isMobile ? ' panel-expanded' : ''}`}>
            <div className="panel-header" style={{ cursor: 'pointer' }} onClick={() => togglePanel('color')}>
              <h3>Garment Colour</h3>
              <div className={`icon-btn${activePanel === 'color' ? ' icon-btn--active' : ''}`}>
                {activePanel === 'color'
                  ? <svg width="16" height="16" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m10.5 3.5-7 7M3.5 3.5l7 7"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                }
              </div>
            </div>
            {activePanel !== 'color' && (
              <div className="panel-meta">
                <span className="meta-chip">{state.garmentColor === '__custom__' ? state.customColorHex : state.garmentColor}</span>
              </div>
            )}
            {activePanel === 'color' && !isMobile && <GarmentColour />}
          </div>

          {/* Artwork */}
          <div className={`sidebar-panel${activePanel === 'artwork' ? ' panel-expanded' : ''}`}>
            <div className="panel-header" style={{ cursor: 'pointer' }} onClick={() => togglePanel('artwork')}>
              <h3>Artwork</h3>
              <div className={`icon-btn${activePanel === 'artwork' ? ' icon-btn--active' : ''}`}>
                {activePanel === 'artwork'
                  ? <svg width="16" height="16" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m10.5 3.5-7 7M3.5 3.5l7 7"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                }
              </div>
            </div>
            {activePanel !== 'artwork' && (
              <div className="panel-meta">
                <span className="meta-chip">{state.artworkTechnique}</span>
              </div>
            )}
            {activePanel === 'artwork' && (
              <ArtworkPanel
                onUpload={handleArtworkUpload}
                onRemove={handleArtworkRemove}
                onAlign={handleArtworkAlign}
                onUpdateTransform={handleArtworkUpdateTransform}
                onUploadLeftChest={handleLeftChestUpload}
                onRemoveLeftChest={handleLeftChestRemove}
              />
            )}
          </div>

          {/* Neck Label */}
          <div className={`sidebar-panel${!isNeckLabelEnabled ? ' panel-disabled' : ''}${activePanel === 'neckLabel' ? ' panel-expanded' : ''}`}>
            <div className="panel-header" style={{ cursor: 'pointer' }} onClick={() => togglePanel('neckLabel')}>
              <h3>Neck Label</h3>
              <div className={`icon-btn${activePanel === 'neckLabel' ? ' icon-btn--active' : ''}`}>
                {activePanel === 'neckLabel'
                  ? <svg width="16" height="16" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m10.5 3.5-7 7M3.5 3.5l7 7"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                }
              </div>
            </div>
            {activePanel !== 'neckLabel' && (
              <div className="panel-meta">
                {isNeckLabelEnabled
                  ? <><span className="meta-chip">{state.neckLabel.dimensions}</span><span className="meta-chip">{state.neckLabel.stitch}</span></>
                  : <span className="meta-chip meta-chip--locked">Locked</span>
                }
              </div>
            )}
            {activePanel === 'neckLabel' && <NeckLabel />}
          </div>

          <PriceSummary />
        </aside>
      </main>

      {/* Mobile floating colour picker */}
      {activePanel === 'color' && isMobile && (
        <div className="floating-color-card">
          <div className="fcc-header">
            <span className="fcc-title">Garment Colour</span>
            <button className="fcc-close" onClick={() => setActivePanel(null)}>
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m10.5 3.5-7 7M3.5 3.5l7 7"/></svg>
            </button>
          </div>
          <GarmentColour />
        </div>
      )}

      {state.isFilterModalOpen && <FilterModal />}
    </div>
  );
}
