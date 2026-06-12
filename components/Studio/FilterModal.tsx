'use client';

import { useStudio } from '@/hooks/useStudioState';

const quantityOptions = [15, 50];
const deliveryOptions = ['Fastest Delivery', 'Fast Delivery', 'Flexible Delivery'];
const ALL_TECHNIQUES  = [
  'Hybrid Digital Print', 'Screen Print', 'Puff Screen Print',
  'Embroidery', 'Embroidery 3D', 'Reflective Heat Transfer', 'Digital Print (DTG)',
];

export default function FilterModal() {
  const {
    state, dispatch,
    isCustomColorEnabled, availableTechniques, isNeckLabelEnabled,
    setQuantity, setDeliverySpeed,
  } = useStudio();

  const close = () => dispatch({ type: 'SET_FILTER_MODAL', open: false });

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="modal-content">
        <button className="close-btn" onClick={close}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="modal-header">
          <h2>Customization Filter</h2>
          <p>Your quantity and delivery speed will determine which features you can use for your order</p>
        </div>

        <div className="config-grid">
          <div className="config-section">
            <h3>Quantity</h3>
            <div className="card-grid">
              {quantityOptions.map((qty) => (
                <div
                  key={qty}
                  className={`selection-card${state.quantity === qty ? ' active' : ''}`}
                  onClick={() => setQuantity(qty)}
                >
                  <div className="card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                  <div className="card-text">
                    <strong>From {qty} units</strong>
                    <span>{qty === 15 ? 'Limited Customization' : 'Advanced'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="config-section">
            <h3>Delivery Speed</h3>
            <div className="card-grid delivery-grid">
              {deliveryOptions.map((speed) => (
                <div
                  key={speed}
                  className={`selection-card small-card${state.deliverySpeed === speed ? ' active' : ''}`}
                  onClick={() => setDeliverySpeed(speed)}
                >
                  <strong>{speed}</strong>
                  <span>
                    {speed === 'Flexible Delivery' ? '1 - 4 Weeks' :
                     speed === 'Fastest Delivery'  ? 'From 04/06' : 'From 17/06'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="features-preview">
          <div className="features-header">
            <h3>Available Features</h3>
            <p>These are the available customization options based on your selection above.</p>
          </div>
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-name">Garment Colour</div>
              <div className="feature-details">
                <span className="detail-text">Signature Colours</span>
                <div className="color-dots">
                  <span className="dot white" /><span className="dot black" />
                  <span className="dot navy" /><span className="dot grey" />
                </div>
                <span className={`detail-badge${!isCustomColorEnabled ? ' is-disabled' : ''}`}>
                  Custom Colours
                </span>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-name">
                Artwork Techniques
                {state.quantity < 50 && <span className="feature-sub">Same technique for both sides</span>}
              </div>
              <div className="feature-details tags-wrap">
                {ALL_TECHNIQUES.map((tech) => (
                  <span
                    key={tech}
                    className={[
                      'tech-tag',
                      !availableTechniques.includes(tech) ? 'is-disabled' : '',
                      state.artworkTechnique === tech && availableTechniques.includes(tech) ? 'is-active' : '',
                    ].join(' ')}
                    onClick={() => availableTechniques.includes(tech) && dispatch({ type: 'SET_ARTWORK_TECHNIQUE', tech })}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div className={`feature-item${!isNeckLabelEnabled ? ' is-disabled-row' : ''}`}>
              <div className="feature-name">Neck Label</div>
              <div className="feature-details tags-wrap">
                {['50×18 mm', '60×20 mm', '65×15 mm', '45×45 mm'].map((l) => (
                  <span key={l} className="label-tag">{l}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={close}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}
