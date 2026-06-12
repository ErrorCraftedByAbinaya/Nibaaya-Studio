'use client';

import { useRef } from 'react';
import { useStudio } from '@/hooks/useStudioState';

interface Props {
  onUpload:              (file: File) => void;
  onRemove:              () => void;
  onAlign:               (dir: string) => void;
  onUpdateTransform:     () => void;
  onUploadLeftChest:     (file: File) => void;
  onRemoveLeftChest:     () => void;
}

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const UploadIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function ArtworkPanel({
  onUpload, onRemove, onAlign, onUpdateTransform, onUploadLeftChest, onRemoveLeftChest,
}: Props) {
  const { state, dispatch, availableTechniques } = useStudio();
  const fileInput          = useRef<HTMLInputElement>(null);
  const leftChestFileInput = useRef<HTMLInputElement>(null);

  const activeViewCapitalized = state.activeView.charAt(0).toUpperCase() + state.activeView.slice(1);
  const currentArtwork = state.artworks[state.activeView as keyof typeof state.artworks];

  const step = (prop: keyof typeof state.artworkTransform, amount: number) => {
    const newVal = parseFloat((state.artworkTransform[prop] + amount).toFixed(2));
    dispatch({ type: 'SET_ARTWORK_TRANSFORM', patch: { [prop]: newVal } });
    onUpdateTransform();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      dispatch({ type: 'SET_ARTWORK', view: state.activeView, artwork: { name: file.name, file } });
      onUpload(file);
    }
    e.target.value = '';
  };

  const removeArt = () => {
    dispatch({ type: 'SET_ARTWORK', view: state.activeView, artwork: null });
    onRemove();
  };

  const onLeftChestFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      dispatch({ type: 'SET_ARTWORK', view: 'leftChest', artwork: { name: file.name, file } });
      onUploadLeftChest(file);
    }
    e.target.value = '';
  };

  const removeLeftChest = () => {
    dispatch({ type: 'SET_ARTWORK', view: 'leftChest', artwork: null });
    onRemoveLeftChest();
  };

  return (
    <div className="artwork-inline-panel">
      <div className="art-header">
        <h4>{activeViewCapitalized} Artwork</h4>
        {currentArtwork && (
          <button className="btn-trash" onClick={(e) => { e.stopPropagation(); removeArt(); }}>
            <TrashIcon />
          </button>
        )}
      </div>

      {!currentArtwork ? (
        <div className="upload-zone" onClick={(e) => { e.stopPropagation(); fileInput.current?.click(); }}>
          <div className="upload-icon"><UploadIcon /></div>
          <p>Drag and drop or click to upload</p>
          <input type="file" ref={fileInput} style={{ display: 'none' }} accept="image/*" onChange={onFileChange} />
        </div>
      ) : (
        <div className="file-card">
          <div className="file-icon-box"><ImageIcon /></div>
          <span className="file-name">{currentArtwork.name}</span>
          <span className="check-icon"><CheckIcon /></span>
        </div>
      )}

      <div className="section-block">
        <label>Front Artwork Technique*</label>
        <select
          className="form-select"
          value={state.artworkTechnique}
          onChange={(e) => dispatch({ type: 'SET_ARTWORK_TECHNIQUE', tech: e.target.value })}
        >
          {availableTechniques.map((tech) => (
            <option key={tech} value={tech}>{tech}</option>
          ))}
        </select>
      </div>

      {state.activeView === 'front' && (
        <div className="section-block left-chest-toggle">
          <label className="toggle-row" onClick={(e) => e.stopPropagation()}>
            <span className="toggle-label-text">Left Chest</span>
            <div className="checkbox-wrapper-2">
              <input
                type="checkbox"
                className="ikxBAC"
                checked={state.leftChestLogo}
                onChange={(e) => dispatch({ type: 'SET_LEFT_CHEST_LOGO', enabled: e.target.checked })}
              />
            </div>
          </label>
        </div>
      )}

      {state.activeView === 'front' && state.leftChestLogo && (
        <>
          <div className="left-chest-divider" />
          <div className="art-header">
            {state.artworks.leftChest && (
              <button className="btn-trash" onClick={(e) => { e.stopPropagation(); removeLeftChest(); }}>
                <TrashIcon />
              </button>
            )}
          </div>
          {!state.artworks.leftChest ? (
            <div className="upload-zone upload-zone--amber" onClick={(e) => { e.stopPropagation(); leftChestFileInput.current?.click(); }}>
              <div className="upload-icon"><UploadIcon size={18} /></div>
              <p>Upload left chest logo</p>
              <input type="file" ref={leftChestFileInput} style={{ display: 'none' }} accept="image/*" onChange={onLeftChestFileChange} />
            </div>
          ) : (
            <div className="file-card file-card--amber">
              <div className="file-icon-box"><ImageIcon /></div>
              <span className="file-name">{state.artworks.leftChest.name}</span>
              <span className="check-icon"><CheckIcon /></span>
            </div>
          )}
        </>
      )}

      <div className="section-block position-block">
        <label>Position</label>
        <div className="align-grid">
          {[
            { dir: 'left',   svg: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" d="M1.6.8v14.4"/><path fill="currentColor" d="M4 10a.8.8 0 0 1 .8-.8H14a.8.8 0 0 1 .8.8v1.2a.8.8 0 0 1-.8.8H4.8a.8.8 0 0 1-.8-.8zM12 6a.8.8 0 0 1-.8.8H4.8A.8.8 0 0 1 4 6V4.8a.8.8 0 0 1 .8-.8h6.4a.8.8 0 0 1 .8.8z"/></svg> },
            { dir: 'center', svg: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" d="M8 .8v14.4"/><path fill="currentColor" d="M2 4.8a.8.8 0 0 1 .8-.8h10.4a.8.8 0 0 1 .8.8V6a.8.8 0 0 1-.8.8H2.8A.8.8 0 0 1 2 6zM12 11.2a.8.8 0 0 1-.8.8H4.8a.8.8 0 0 1-.8-.8V10a.8.8 0 0 1 .8-.8h6.4a.8.8 0 0 1 .8.8z"/></svg> },
            { dir: 'right',  svg: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" d="M14.4.8v14.4"/><path fill="currentColor" d="M1.2 10a.8.8 0 0 1 .8-.8h9.2a.8.8 0 0 1 .8.8v1.2a.8.8 0 0 1-.8.8H2a.8.8 0 0 1-.8-.8zM12 6a.8.8 0 0 1-.8.8H4.8A.8.8 0 0 1 4 6V4.8a.8.8 0 0 1 .8-.8h6.4a.8.8 0 0 1 .8.8z"/></svg> },
            { dir: 'top',    svg: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" d="M15.2 1.6H.8"/><path fill="currentColor" d="M4.8 14.8A.8.8 0 0 1 4 14V4.8a.8.8 0 0 1 .8-.8H6a.8.8 0 0 1 .8.8V14a.8.8 0 0 1-.8.8zM11.2 4a.8.8 0 0 1 .8.8v6.4a.8.8 0 0 1-.8.8H10a.8.8 0 0 1-.8-.8V4.8A.8.8 0 0 1 10 4z"/></svg> },
            { dir: 'middle', svg: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" d="M15.2 8H.8"/><path fill="currentColor" d="M4.8 14a.8.8 0 0 1-.8-.8V2.8a.8.8 0 0 1 .8-.8H6a.8.8 0 0 1 .8.8v10.4a.8.8 0 0 1-.8.8zM11.2 4a.8.8 0 0 1 .8.8v6.4a.8.8 0 0 1-.8.8H10a.8.8 0 0 1-.8-.8V4.8A.8.8 0 0 1 10 4z"/></svg> },
            { dir: 'bottom', svg: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" d="M15.2 14.4H.8"/><path fill="currentColor" d="M4.8 12a.8.8 0 0 1-.8-.8V2a.8.8 0 0 1 .8-.8H6a.8.8 0 0 1 .8.8v9.2a.8.8 0 0 1-.8.8zM11.2 4a.8.8 0 0 1 .8.8v6.4a.8.8 0 0 1-.8.8H10a.8.8 0 0 1-.8-.8V4.8A.8.8 0 0 1 10 4z"/></svg> },
          ].map(({ dir, svg }) => (
            <button key={dir} className="align-btn" onClick={(e) => { e.stopPropagation(); onAlign(dir); }}>{svg}</button>
          ))}
        </div>
      </div>

      <div className="dimensions-inputs">
        {(['width', 'height'] as const).map((prop) => (
          <div key={prop} className="input-group">
            <label>{prop.charAt(0).toUpperCase() + prop.slice(1)}</label>
            <div className="input-box">
              <input
                type="number" step="0.1"
                value={state.artworkTransform[prop]}
                onChange={(e) => dispatch({ type: 'SET_ARTWORK_TRANSFORM', patch: { [prop]: parseFloat(e.target.value) } })}
                onBlur={onUpdateTransform}
              />
              <div className="stepper">
                <button onClick={(e) => { e.stopPropagation(); step(prop, -0.5); }}>-</button>
                <button onClick={(e) => { e.stopPropagation(); step(prop, 0.5); }}>+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dimensions-inputs">
        {(['fromNeck', 'fromCenter'] as const).map((prop) => (
          <div key={prop} className="input-group">
            <label>{prop === 'fromNeck' ? 'From Neck' : 'From Center'}</label>
            <div className="input-box">
              <input
                type="number" step="0.1"
                value={state.artworkTransform[prop]}
                onChange={(e) => dispatch({ type: 'SET_ARTWORK_TRANSFORM', patch: { [prop]: parseFloat(e.target.value) } })}
                onBlur={onUpdateTransform}
              />
              <div className="stepper">
                <button onClick={(e) => { e.stopPropagation(); step(prop, -0.5); }}>-</button>
                <button onClick={(e) => { e.stopPropagation(); step(prop, 0.5); }}>+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="measurements-note">All measurements are in cm</p>
    </div>
  );
}
