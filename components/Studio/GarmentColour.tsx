'use client';

import { useStudio } from '@/hooks/useStudioState';

export default function GarmentColour() {
  const { state, dispatch } = useStudio();

  const pickCustomColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_CUSTOM_COLOR_HEX', hex: e.target.value });
    dispatch({ type: 'SET_GARMENT_COLOR',    color: '__custom__' });
  };

  return (
    <div className="color-inline-panel">
      <p className="section-title">Signature</p>
      <div className="color-grid">
        {state.signatureColors.map((color) => (
          <div
            key={color.name}
            className={`color-option${state.garmentColor === color.name ? ' active' : ''}`}
            onClick={() => dispatch({ type: 'SET_GARMENT_COLOR', color: color.name })}
          >
            <div className="color-swatch-wrapper">
              <span className="color-swatch" style={{ backgroundColor: color.hex }} />
            </div>
            <span className="color-name">{color.name}</span>
          </div>
        ))}
      </div>

      <div className="custom-color-section">
        <p className="section-title">Custom</p>
        <label className={`color-option custom-color-option${state.garmentColor === '__custom__' ? ' active' : ''}`}>
          <div className="color-swatch-wrapper">
            <span className="color-swatch color-swatch--picker" style={{ backgroundColor: state.customColorHex }}>
              <input
                type="color"
                className="color-picker-input"
                value={state.customColorHex}
                onChange={pickCustomColor}
              />
            </span>
          </div>
          <div className="custom-color-label">
            <span className="color-name">Pick a colour</span>
            <span className="custom-hex">
              {state.garmentColor === '__custom__' ? state.customColorHex : ''}
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
