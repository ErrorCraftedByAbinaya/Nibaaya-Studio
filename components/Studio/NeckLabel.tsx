'use client';

import { useStudio } from '@/hooks/useStudioState';

const dimensionsList = ['50×18 mm', '60×20 mm', '65×15 mm', '45×45 mm'];
const positionsList  = ['Below neck tape (5mm)', 'On neck tape'];
const stitchList     = ['2-side', '4-corner', '2-corner'];

export default function NeckLabel() {
  const { state, dispatch } = useStudio();

  const setDimensions = (dim: string) => dispatch({ type: 'SET_NECK_LABEL', patch: { dimensions: dim } });
  const setPosition   = (pos: string) => dispatch({ type: 'SET_NECK_LABEL', patch: { position: pos } });
  const setStitch     = (st: string)  => dispatch({ type: 'SET_NECK_LABEL', patch: { stitch: st } });

  return (
    <div className="neck-inline-panel">
      <div className="section-block">
        <h3>Dimensions</h3>
        <div className="cards-row dimensions-row">
          {dimensionsList.map((dim) => (
            <div
              key={dim}
              className={`option-card square-card${state.neckLabel.dimensions === dim ? ' active' : ''}`}
              onClick={() => setDimensions(dim)}
            >
              <div className={`dim-icon icon-${dim.replace('×', 'x').replace(' mm', '')}`} />
              <span>{dim}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-block">
        <h3>Position</h3>
        <div className="cards-row">
          {positionsList.map((pos) => (
            <div
              key={pos}
              className={`option-card pos-card${state.neckLabel.position === pos ? ' active' : ''}`}
              onClick={() => setPosition(pos)}
            >
              <div className={`pos-graphic${pos === 'On neck tape' ? ' on-tape' : ''}`}>
                <div className="tape-line" />
                <div className="tape-line" />
                <div className="label-box" />
              </div>
              <span>{pos}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-block">
        <h3>Stitch</h3>
        <div className="cards-row">
          {stitchList.map((stitch) => (
            <div
              key={stitch}
              className={`option-card stitch-card${state.neckLabel.stitch === stitch ? ' active' : ''}`}
              onClick={() => setStitch(stitch)}
            >
              <div className={`stitch-graphic type-${stitch}`}>
                <div className="stitch-box">
                  <span className="stitch-mark s-top-left" />
                  <span className="stitch-mark s-top-right" />
                  <span className="stitch-mark s-bottom-left" />
                  <span className="stitch-mark s-bottom-right" />
                </div>
              </div>
              <span>{stitch}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
