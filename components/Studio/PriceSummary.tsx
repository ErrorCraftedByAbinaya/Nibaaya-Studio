'use client';

import { useState, useEffect, useRef } from 'react';
import { useStudio } from '@/hooks/useStudioState';
import { usePricing } from '@/hooks/usePricing';

export default function PriceSummary() {
  const { state, setQuantity, isNeckLabelEnabled } = useStudio();
  const breakdown = usePricing(state, isNeckLabelEnabled);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDimmed,   setIsDimmed]   = useState(false);
  const dimTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetDimTimer = () => {
    if (dimTimer.current) clearTimeout(dimTimer.current);
    setIsDimmed(false);
    dimTimer.current = setTimeout(() => setIsDimmed(true), 3200);
  };

  useEffect(() => { resetDimTimer(); return () => { if (dimTimer.current) clearTimeout(dimTimer.current); }; }, []);

  const openSheet  = () => { setIsExpanded(true);  if (dimTimer.current) clearTimeout(dimTimer.current); setIsDimmed(false); };
  const closeSheet = () => { setIsExpanded(false); resetDimTimer(); };

  const QtyControls = () => (
    <div className="qty-controls">
      <button onClick={() => setQuantity(Math.max(15, state.quantity - 5))}>−</button>
      <span className="qty-val">{state.quantity}</span>
      <button onClick={() => setQuantity(state.quantity + 5)}>+</button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar bar */}
      <div className="desktop-bar">
        <div className="dbar-top">
          <div className="dbar-qty-block">
            <span className="bar-label">Quantity</span>
            <QtyControls />
          </div>
          <div className="dbar-unit-block">
            <span className="bar-label">Unit Cost</span>
            <div className="bar-value-row">
              <span className="bar-value">{breakdown.fmt(breakdown.perUnit)}</span>
              <s className="bar-mrp">{breakdown.fmt(breakdown.mrpPerUnit)}</s>
            </div>
          </div>
        </div>
        <div className="dbar-pills">
          <div className="pills">
            {breakdown.items.map((item) => (
              <span key={item.label} className="pill">
                {item.label}&thinsp;<strong>{breakdown.fmt(item.perUnit)}</strong>
              </span>
            ))}
          </div>
        </div>
        <div className="dbar-bottom">
          <div className="dbar-total-block">
            <span className="bar-label">Total Order</span>
            <span className="bar-total">{breakdown.fmt(breakdown.totalOrder)}</span>
          </div>
          <button className="btn-add-cart">
            Add To Cart
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile floating pill */}
      {!isExpanded && (
        <button
          className={`price-pill${isDimmed ? ' price-pill--dim' : ''}`}
          onMouseEnter={() => { if (dimTimer.current) clearTimeout(dimTimer.current); setIsDimmed(false); }}
          onMouseLeave={resetDimTimer}
          onClick={openSheet}
          aria-label="View price summary"
        >
          <span className="pill-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </span>
          <span className="pill-qty-badge">{state.quantity}</span>
          <span className="pill-sep" />
          <span className="pill-prices">
            <span className="pill-total-val">{breakdown.fmt(breakdown.totalOrder)}</span>
            <span className="pill-unit-val">{breakdown.fmt(breakdown.perUnit)}/pc</span>
          </span>
          <span className="pill-chevron">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </span>
        </button>
      )}

      {/* Mobile expanded sheet */}
      {isExpanded && (
        <div className="price-sheet" role="dialog" aria-modal="true">
          <div className="sheet-backdrop" onClick={closeSheet} />
          <div className="sheet-panel">
            <div className="sheet-handle" />
            <div className="sheet-header">
              <span className="sheet-title">Order Summary</span>
              <button className="sheet-close-btn" onClick={closeSheet} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="sheet-divider" />
            <div className="sheet-row">
              <span className="sheet-row-label">Quantity</span>
              <QtyControls />
            </div>
            <div className="sheet-row">
              <span className="sheet-row-label">Unit Cost</span>
              <div className="sheet-price-stack">
                <span className="sheet-unit-price">{breakdown.fmt(breakdown.perUnit)}</span>
                <s className="sheet-mrp">MRP {breakdown.fmt(breakdown.mrpPerUnit)}</s>
              </div>
            </div>
            <div className="sheet-divider" />
            <div className="sheet-breakdown-label">Includes</div>
            <div className="sheet-breakdown-pills">
              {breakdown.items.map((item) => (
                <div key={item.label} className="breakdown-chip">
                  <span className="chip-label">{item.label}</span>
                  <span className="chip-val">{breakdown.fmt(item.perUnit)}</span>
                  {item.sublabel && <span className="chip-sub">{item.sublabel}</span>}
                </div>
              ))}
            </div>
            <div className="sheet-divider" />
            <div className="sheet-total-row">
              <div className="sheet-total-label">
                <span>Total Order</span>
                <span className="sheet-total-sub">{state.quantity} pcs × {breakdown.fmt(breakdown.perUnit)}</span>
              </div>
              <span className="sheet-total-val">{breakdown.fmt(breakdown.totalOrder)}</span>
            </div>
            <button className="btn-sheet-checkout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Add To Cart
            </button>
          </div>
        </div>
      )}
    </>
  );
}
