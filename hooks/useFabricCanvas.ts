import { useEffect, useRef, useCallback } from 'react';
import * as fabric from 'fabric';
import type { StudioState, ActiveView } from '@/lib/types';

// Helper: cast any Fabric object to a plain record so we can read/write custom props
const asRec = (o: unknown): Record<string, unknown> => o as unknown as Record<string, unknown>;

const PIXELS_PER_CM = 10;

const NECK_LABEL_CFG: Record<string, { wRatio: number; aspectH: number }> = {
  '50×18 mm': { wRatio: 0.20, aspectH: 18 / 50 },
  '60×20 mm': { wRatio: 0.20, aspectH: 20 / 60 },
  '65×15 mm': { wRatio: 0.20, aspectH: 15 / 65 },
  '45×45 mm': { wRatio: 0.18, aspectH: 25 / 45 },
};

const NECK_POSITION_RATIO: Record<string, number> = {
  'On neck tape': 0.38,
  'Below neck tape (5mm)': 0.48,
};

interface BaseImageInfo { renderedWidth: number; renderedHeight: number }

export function useFabricCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  state: StudioState,
  onTransformUpdate: (patch: Partial<StudioState['artworkTransform']>) => void,
) {
  const fabricRef   = useRef<fabric.Canvas | null>(null);
  const baseInfoRef = useRef<BaseImageInfo | null>(null);
  const loadGenRef  = useRef(0);
  const imageLoadingRef = useRef(false);
  const pendingColorRef = useRef(false);
  const resizeTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Always-fresh state ref (avoids stale closures in fabric event handlers)
  const stateRef = useRef(state);
  stateRef.current = state;

  const onTransformRef = useRef(onTransformUpdate);
  onTransformRef.current = onTransformUpdate;

  // ── Geometry helpers ──────────────────────────────────────────────────────

  const getLeftChestGeometry = useCallback(() => {
    const s = stateRef.current;
    const fc = fabricRef.current;
    const canvasW = fc ? fc.width! : 500;
    const canvasH = fc ? fc.height! : 500;
    const cfg = s.printArea?.leftChest ?? {
      widthRatio: 0.14, heightRatio: 0.14, fromTopRatio: 0.41, fromCenterRatio: -0.115, artworkScale: 0.9,
    };
    if (!baseInfoRef.current) {
      const sc = Math.min(canvasW, canvasH) / 500;
      return {
        cx: canvasW / 2 + cfg.fromCenterRatio * 500 * sc,
        cy: canvasH / 2 + (cfg.fromTopRatio - 0.5) * 500 * sc,
        width: cfg.widthRatio * 500 * sc, height: cfg.heightRatio * 500 * sc,
        artworkScale: cfg.artworkScale,
      };
    }
    const { renderedWidth, renderedHeight } = baseInfoRef.current;
    return {
      cx: canvasW / 2 + renderedWidth * cfg.fromCenterRatio,
      cy: canvasH / 2 + renderedHeight * (cfg.fromTopRatio - 0.5),
      width: renderedWidth * cfg.widthRatio, height: renderedWidth * cfg.heightRatio,
      artworkScale: cfg.artworkScale,
    };
  }, []);

  const getSafeAreaGeometry = useCallback(() => {
    const s = stateRef.current;
    const fc = fabricRef.current;
    if (!baseInfoRef.current || !fc) {
      const sc = Math.min(fc?.width ?? 500, fc?.height ?? 500) / 500;
      if (s.activeView === 'neck')
        return { topOffset: -100 * sc, width: 100 * sc, height: 36 * sc, scale: 0.5, notch: null };
      return { topOffset: 30 * sc, width: 250 * sc, height: 350 * sc, scale: 0.6, notch: null };
    }
    const { renderedWidth, renderedHeight } = baseInfoRef.current;
    if (s.activeView === 'neck') {
      const neckCfg = NECK_LABEL_CFG[s.neckLabel.dimensions] || NECK_LABEL_CFG['50×18 mm'];
      const fromTop = NECK_POSITION_RATIO[s.neckLabel.position] ?? 0.34;
      const w = renderedWidth * neckCfg.wRatio;
      const h = w * neckCfg.aspectH;
      return { topOffset: renderedHeight * (fromTop - 0.5), width: w, height: h, scale: 0.5, notch: null };
    }
    const cfg = s.printArea?.[s.activeView as 'front' | 'back'] ?? s.printArea?.front;
    const w = renderedWidth * cfg.widthRatio;
    const h = renderedHeight * cfg.heightRatio;
    return {
      topOffset: renderedHeight * (cfg.fromTopRatio - 0.5),
      width: w, height: h, scale: cfg.artworkScale,
      notch: cfg.notch ? { width: w * cfg.notch.widthRatio, height: h * cfg.notch.heightRatio } : null,
    };
  }, []);

  // ── Artwork normalisation ─────────────────────────────────────────────────

  const normalizeArtwork = useCallback((obj: fabric.FabricObject & Record<string, unknown>) => {
    const fc = fabricRef.current;
    if (!fc || !baseInfoRef.current) return;
    let refCx: number, refCy: number, refW: number, refH: number;
    if (obj['viewName'] === 'leftChest') {
      const lcGeo = getLeftChestGeometry();
      refCx = lcGeo.cx; refCy = lcGeo.cy; refW = lcGeo.width; refH = lcGeo.height;
    } else {
      const geo = getSafeAreaGeometry();
      refCx = fc.width! / 2; refCy = fc.height! / 2 + geo.topOffset; refW = geo.width; refH = geo.height;
    }
    (obj as Record<string, unknown>)['_rx']  = ((obj.left ?? 0) - refCx) / refW;
    (obj as Record<string, unknown>)['_ry']  = ((obj.top ?? 0) - refCy) / refH;
    (obj as Record<string, unknown>)['_rsx'] = (obj.width! * obj.scaleX!) / refW;
    (obj as Record<string, unknown>)['_rsy'] = (obj.height! * obj.scaleY!) / refH;
  }, [getLeftChestGeometry, getSafeAreaGeometry]);

  const restoreArtworkPositions = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc || !baseInfoRef.current) return;
    const geo = getSafeAreaGeometry();
    const cx = fc.width! / 2, cy = fc.height! / 2 + geo.topOffset;
    fc.getObjects().forEach((raw) => {
      const obj = raw as unknown as fabric.FabricObject & Record<string, unknown>;
      if (!obj['viewName'] || typeof obj['_rx'] === 'undefined') return;
      let refCx: number, refCy: number, refW: number, refH: number;
      if (obj['viewName'] === 'leftChest') {
        const lcGeo = getLeftChestGeometry();
        refCx = lcGeo.cx; refCy = lcGeo.cy; refW = lcGeo.width; refH = lcGeo.height;
      } else {
        refCx = cx; refCy = cy; refW = geo.width; refH = geo.height;
      }
      obj.set({
        left: refCx + (obj['_rx'] as number) * refW,
        top:  refCy + (obj['_ry'] as number) * refH,
        scaleX: ((obj['_rsx'] as number) * refW) / obj.width!,
        scaleY: ((obj['_rsy'] as number) * refH) / obj.height!,
      });
      obj.setCoords();
      if (obj.clipPath) {
        obj.clipPath.set({ left: refCx, top: refCy, width: refW, height: refH });
      }
    });
    fc.renderAll();
  }, [getSafeAreaGeometry, getLeftChestGeometry]);

  // ── Transform sync ────────────────────────────────────────────────────────

  const syncTransformToState = useCallback((obj: fabric.FabricObject & Record<string, unknown>) => {
    const s = stateRef.current;
    const fc = fabricRef.current;
    if (!obj || obj['viewName'] !== s.activeView || !fc) return;
    normalizeArtwork(obj);
    const geo = getSafeAreaGeometry();
    const w = (obj.width! * obj.scaleX!) / PIXELS_PER_CM;
    const h = (obj.height! * obj.scaleY!) / PIXELS_PER_CM;
    const safeAreaCenterY = fc.height! / 2 + geo.topOffset;
    const safeAreaTopY    = safeAreaCenterY - geo.height / 2;
    const fromNeck   = ((obj.top ?? 0) - (obj.height! * obj.scaleY!) / 2 - safeAreaTopY) / PIXELS_PER_CM;
    const fromCenter = ((obj.left ?? 0) - fc.width! / 2) / PIXELS_PER_CM;
    onTransformRef.current({
      width: parseFloat(w.toFixed(2)), height: parseFloat(h.toFixed(2)),
      fromNeck: parseFloat(fromNeck.toFixed(2)), fromCenter: parseFloat(fromCenter.toFixed(2)),
    });
  }, [normalizeArtwork, getSafeAreaGeometry]);

  // ── Color application ─────────────────────────────────────────────────────

  const applyGarmentColor = useCallback(() => {
    const s = stateRef.current;
    const fc = fabricRef.current;
    if (!fc) return;
    const img = fc.getObjects().find((o) => asRec(o)['isBaseImage']);
    if (!img) return;
    let hex: string;
    if (s.garmentColor === '__custom__') {
      hex = s.customColorHex;
    } else {
      const activeColor = s.signatureColors.find((c) => c.name === s.garmentColor);
      hex = activeColor?.hex ?? '#ffffff';
    }
    if (hex && hex !== '#ffffff') {
      (img as fabric.Image).filters = [new fabric.filters.BlendColor({ color: hex, mode: 'multiply', alpha: 0.85 })];
    } else {
      (img as fabric.Image).filters = [];
    }
    (img as fabric.Image).applyFilters();
    (img as fabric.FabricObject & { dirty?: boolean }).dirty = true;
    fc.renderAll();
  }, []);

  // ── Safe-area overlay ─────────────────────────────────────────────────────

  const drawSafeArea = useCallback(() => {
    const s = stateRef.current;
    const fc = fabricRef.current;
    if (!fc) return;
    fc.getObjects().filter((o) => asRec(o)['isSafeArea'] || asRec(o)['isLeftChestSafeArea'])
      .forEach((o) => fc.remove(o));

    const geo = getSafeAreaGeometry();
    const dim = Math.min(fc.width!, fc.height!);
    const strokeW = Math.max(1, dim * 0.0025);

    const safeZoneProps = {
      fill: 'rgba(139, 92, 246, 0.02)', stroke: '#f33838ff',
      strokeWidth: strokeW, strokeDashArray: [5],
      selectable: false, evented: false, opacity: 0.8,
    };

    if (geo.notch) {
      const W = geo.width / 2, H = geo.height / 2;
      const nW = geo.notch.width / 2, nH = geo.notch.height;
      const pathStr = `M ${-W} ${-H} L ${-nW} ${-H} L ${-nW} ${-H + nH} L ${nW} ${-H + nH} L ${nW} ${-H} L ${W} ${-H} L ${W} ${H} L ${-W} ${H} Z`;
      fc.add(new fabric.Path(pathStr, {
        ...safeZoneProps, left: fc.width! / 2, top: fc.height! / 2 + geo.topOffset,
        originX: 'center', originY: 'center',
      } as unknown as fabric.PathProps));
    } else {
      fc.add(Object.assign(new fabric.Rect(), {
        ...safeZoneProps, left: fc.width! / 2, top: fc.height! / 2 + geo.topOffset,
        originX: 'center', originY: 'center', width: geo.width, height: geo.height,
        isSafeArea: true,
      }));
    }

    if (s.activeView === 'front' && s.leftChestLogo) {
      const lcGeo = getLeftChestGeometry();
      fc.add(Object.assign(new fabric.Rect(), {
        isLeftChestSafeArea: true,
        left: lcGeo.cx, top: lcGeo.cy, originX: 'center', originY: 'center',
        width: lcGeo.width, height: lcGeo.height,
        fill: 'rgba(234, 179, 8, 0.03)', stroke: '#3908eaff',
        strokeWidth: strokeW, strokeDashArray: [5], selectable: false, evented: false, opacity: 0.8,
      }));
    }
    fc.renderAll();
  }, [getSafeAreaGeometry, getLeftChestGeometry]);

  // ── Base image loading ────────────────────────────────────────────────────

  const loadBaseImage = useCallback((viewName: ActiveView) => {
    const s = stateRef.current;
    const fc = fabricRef.current;
    if (!fc) return;
    const generation = ++loadGenRef.current;

    fc.getObjects().forEach((obj) => {
      const o = obj as unknown as fabric.FabricObject & Record<string, unknown>;
      if (o['isBaseImage'] || o['isSafeArea'] || o['isLeftChestSafeArea']) {
        fc.remove(obj);
      } else {
        o['visible'] = o['viewName'] === 'leftChest'
          ? viewName === 'front' && s.leftChestLogo
          : o['viewName'] === viewName;
        if (!o['visible'] && fc.getActiveObject() === obj) fc.discardActiveObject();
      }
    });

    imageLoadingRef.current = true;
    pendingColorRef.current = false;

    fabric.Image.fromURL(s.baseImages[viewName]).then((img) => {
      if (generation !== loadGenRef.current) return;
      const wScale = fc.width! / img.width!;
      const hScale = fc.height! / img.height!;
      const isMobile = fc.height! > fc.width!;
      const scale = (isMobile ? Math.min(hScale, wScale * 1.4) : Math.min(wScale, hScale)) * 0.97;

      baseInfoRef.current = { renderedWidth: img.width! * scale, renderedHeight: img.height! * scale };

      (img as unknown as fabric.FabricObject & Record<string, unknown>)['isBaseImage'] = true;
      img.set({
        selectable: false, evented: false,
        left: fc.width! / 2, top: fc.height! / 2,
        originX: 'center', originY: 'center',
        scaleX: scale, scaleY: scale, opacity: 0.97,
      });
      fc.add(img);
      fc.sendObjectToBack(img);

      imageLoadingRef.current = false;
      if (pendingColorRef.current) applyGarmentColor();
      else applyGarmentColor();
      drawSafeArea();
      restoreArtworkPositions();
    });
  }, [applyGarmentColor, drawSafeArea, restoreArtworkPositions]);

  // ── Canvas resize ─────────────────────────────────────────────────────────

  const resizeCanvas = useCallback(() => {
    const fc = fabricRef.current;
    const container = containerRef.current;
    if (!container || !fc) return;
    if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    resizeTimerRef.current = setTimeout(() => {
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW < 1 || newH < 1) return;
      fc.setDimensions({ width: newW, height: newH });
      loadBaseImage(stateRef.current.activeView);
    }, 100);
  }, [containerRef, loadBaseImage]);

  // ── Canvas init (once) ────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const fc = new fabric.Canvas(canvas, {
      width: container.clientWidth,
      height: container.clientHeight,
      preserveObjectStacking: true,
    });
    fabricRef.current = fc;

    loadBaseImage(stateRef.current.activeView);

    fc.on('object:moving', (e) => {
      const obj = e.target as unknown as fabric.FabricObject & Record<string, unknown>;
      if (obj['viewName'] === 'leftChest') normalizeArtwork(obj);
      else syncTransformToState(obj);
    });
    fc.on('object:scaling', (e) => {
      const obj = e.target as unknown as fabric.FabricObject & Record<string, unknown>;
      if (obj['viewName'] === 'leftChest') normalizeArtwork(obj);
      else syncTransformToState(obj);
    });

    const ro = new ResizeObserver(() => resizeCanvas());
    ro.observe(container);

    return () => {
      ro.disconnect();
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      fc.dispose();
      fabricRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Watch: activeView ─────────────────────────────────────────────────────
  useEffect(() => {
    if (fabricRef.current) loadBaseImage(state.activeView);
  }, [state.activeView, loadBaseImage]);

  // ── Watch: garmentColor / customColorHex ─────────────────────────────────
  useEffect(() => {
    if (!fabricRef.current) return;
    if (imageLoadingRef.current) { pendingColorRef.current = true; return; }
    applyGarmentColor();
  }, [state.garmentColor, state.customColorHex, applyGarmentColor]);

  // ── Watch: neckLabel ─────────────────────────────────────────────────────
  useEffect(() => {
    if (state.activeView === 'neck' && fabricRef.current) {
      drawSafeArea();
      restoreArtworkPositions();
    }
  }, [state.neckLabel, state.activeView, drawSafeArea, restoreArtworkPositions]);

  // ── Watch: leftChestLogo ─────────────────────────────────────────────────
  useEffect(() => {
    if (!fabricRef.current || state.activeView !== 'front') return;
    if (!state.leftChestLogo) removeLeftChestArtwork();
    drawSafeArea();
    restoreArtworkPositions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.leftChestLogo]);

  // ── Public artwork API ────────────────────────────────────────────────────

  const addArtwork = useCallback((customUrl: string) => {
    const s = stateRef.current;
    const fc = fabricRef.current;
    if (!fc || !customUrl) return;
    const geo = getSafeAreaGeometry();
    const clipRect = Object.assign(new fabric.Rect(), {
      left: fc.width! / 2, top: fc.height! / 2 + geo.topOffset,
      originX: 'center', originY: 'center',
      width: geo.width, height: geo.height, absolutePositioned: true,
    });
    fabric.Image.fromURL(customUrl).then((img) => {
      const scaleToFit = Math.min(geo.width / img.width!, geo.height / img.height!) * 0.92;
      const finalScale = Math.min(scaleToFit, geo.scale || 1);
      const imgObj = img as unknown as fabric.FabricObject & Record<string, unknown>;
      imgObj['viewName'] = s.activeView;
      img.set({
        left: fc.width! / 2, top: fc.height! / 2 + geo.topOffset,
        originX: 'center', originY: 'center',
        scaleX: finalScale, scaleY: finalScale, clipPath: clipRect,
        borderColor: '#8b5cf6', cornerColor: '#8b5cf6', cornerStrokeColor: '#fff',
        transparentCorners: false, cornerSize: 9, padding: 6,
      });
      fc.add(img);
      fc.setActiveObject(img);
      fc.renderAll();
      syncTransformToState(imgObj);
      normalizeArtwork(imgObj);
    });
  }, [getSafeAreaGeometry, syncTransformToState, normalizeArtwork]);

  const removeArtwork = useCallback(() => {
    const s = stateRef.current;
    const fc = fabricRef.current;
    if (!fc) return;
    const obj = fc.getObjects().find((o) => asRec(o)['viewName'] === s.activeView);
    if (obj) { fc.remove(obj); fc.renderAll(); }
  }, []);

  const addLeftChestArtwork = useCallback((customUrl: string) => {
    const fc = fabricRef.current;
    if (!fc || !customUrl) return;
    const lcGeo = getLeftChestGeometry();
    const clipRect = Object.assign(new fabric.Rect(), {
      left: lcGeo.cx, top: lcGeo.cy, originX: 'center', originY: 'center',
      width: lcGeo.width, height: lcGeo.height, absolutePositioned: true,
    });
    fabric.Image.fromURL(customUrl).then((img) => {
      const scale = Math.min(lcGeo.width / img.width!, lcGeo.height / img.height!) * (lcGeo.artworkScale ?? 0.9);
      const imgObj = img as unknown as fabric.FabricObject & Record<string, unknown>;
      imgObj['viewName'] = 'leftChest';
      img.set({
        left: lcGeo.cx, top: lcGeo.cy, originX: 'center', originY: 'center',
        scaleX: scale, scaleY: scale, clipPath: clipRect,
        borderColor: '#eab308', cornerColor: '#eab308', cornerStrokeColor: '#fff',
        transparentCorners: false, cornerSize: 9, padding: 6,
      });
      fc.add(img);
      fc.setActiveObject(img);
      fc.renderAll();
      normalizeArtwork(imgObj);
    });
  }, [getLeftChestGeometry, normalizeArtwork]);

  function removeLeftChestArtwork() {
    const fc = fabricRef.current;
    if (!fc) return;
    const obj = fc.getObjects().find((o) => asRec(o)['viewName'] === 'leftChest');
    if (obj) { fc.remove(obj); fc.renderAll(); }
  }

  const alignArtwork = useCallback((direction: string) => {
    const s = stateRef.current;
    const fc = fabricRef.current;
    if (!fc) return;
    const obj = fc.getActiveObject() as (fabric.FabricObject & Record<string, unknown>) | null;
    if (!obj || obj['viewName'] !== s.activeView) return;
    const geo = getSafeAreaGeometry();
    const cx = fc.width! / 2, cy = fc.height! / 2 + geo.topOffset;
    const left = cx - geo.width / 2, right = cx + geo.width / 2;
    const top  = cy - geo.height / 2, bot  = cy + geo.height / 2;
    const w = obj.width! * obj.scaleX!, h = obj.height! * obj.scaleY!;
    switch (direction) {
      case 'left':   obj.set({ left: left + w / 2 }); break;
      case 'center': obj.set({ left: cx });            break;
      case 'right':  obj.set({ left: right - w / 2 }); break;
      case 'top':    obj.set({ top:  top + h / 2 });   break;
      case 'middle': obj.set({ top:  cy });             break;
      case 'bottom': obj.set({ top:  bot - h / 2 });   break;
    }
    obj.setCoords();
    fc.renderAll();
    syncTransformToState(obj);
  }, [getSafeAreaGeometry, syncTransformToState]);

  const applyTransformFromState = useCallback(() => {
    const s = stateRef.current;
    const fc = fabricRef.current;
    if (!fc) return;
    const obj = (fc.getActiveObject() || fc.getObjects().find((o) => asRec(o)['viewName'] === s.activeView)) as (fabric.FabricObject & Record<string, unknown>) | undefined;
    if (!obj) return;
    const geo = getSafeAreaGeometry();
    const safeCenterX = fc.width! / 2;
    const safeCenterY = fc.height! / 2 + geo.topOffset;
    const safeTopY    = safeCenterY - geo.height / 2;
    const wPx = s.artworkTransform.width * PIXELS_PER_CM;
    const hPx = s.artworkTransform.height * PIXELS_PER_CM;
    obj.set({
      scaleX: wPx / obj.width!,
      scaleY: hPx / obj.height!,
      left: safeCenterX + s.artworkTransform.fromCenter * PIXELS_PER_CM,
      top:  safeTopY + s.artworkTransform.fromNeck * PIXELS_PER_CM + hPx / 2,
    });
    obj.setCoords();
    normalizeArtwork(obj);
    fc.renderAll();
  }, [getSafeAreaGeometry, normalizeArtwork]);

  return { addArtwork, removeArtwork, alignArtwork, applyTransformFromState, addLeftChestArtwork, removeLeftChestArtwork };
}
