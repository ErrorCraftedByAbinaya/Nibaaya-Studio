'use client';

import React, { createContext, useContext, useReducer, useMemo } from 'react';
import type {
  StudioState, StudioProduct, ActiveView, ArtworkFile,
  ArtworkTransform, NeckLabelConfig, Color, PrintArea,
} from '@/lib/types';

// ─── Static defaults ──────────────────────────────────────────────────────────

export const DEFAULT_COLORS: Color[] = [
  { name: 'Bright White',     hex: '#ffffff' },
  { name: 'Ecru',             hex: '#f5ebdf' },
  { name: 'True Black',       hex: '#111111' },
  { name: 'Oat Milk',         hex: '#e8ddc7' },
  { name: 'Indian Almond',    hex: '#8a7963' },
  { name: 'Cocoa Mocha',      hex: '#634b39' },
  { name: 'Buffalo Chip',     hex: '#4f3c2e' },
  { name: 'Glacier Lake',     hex: '#81a3b8' },
  { name: 'Silver Bullet',    hex: '#94959f' },
  { name: 'Deep Periwinkle',  hex: '#65709e' },
  { name: 'Amparo Blue',      hex: '#375791' },
  { name: 'Blue Ribbon',      hex: '#2c3968' },
  { name: 'Odyssey Gray',     hex: '#40454f' },
  { name: 'Polar Night',      hex: '#1c212b' },
  { name: 'Dark Navy',        hex: '#161d2b' },
  { name: 'Northern Droplet', hex: '#d9dcdc' },
  { name: 'Seagrass',         hex: '#9fb09f' },
  { name: 'Martini Olive',    hex: '#63664d' },
];

const DEFAULT_IMAGES = {
  front: '/images/garments/classic-tshirt-front.png',
  neck:  '/images/garments/classic-tshirt-neck.png',
  back:  '/images/garments/classic-tshirt-back.png',
};

const DEFAULT_LEFT_CHEST = {
  widthRatio: 0.10, heightRatio: 0.10, fromTopRatio: 0.30,
  fromCenterRatio: 0.123, artworkScale: 0.9,
};

const DEFAULT_PRINT_AREA: PrintArea = {
  front:     { widthRatio: 0.35, heightRatio: 0.52, fromTopRatio: 0.57, artworkScale: 0.88 },
  back:      { widthRatio: 0.35, heightRatio: 0.52, fromTopRatio: 0.57, artworkScale: 0.88 },
  leftChest: DEFAULT_LEFT_CHEST,
};

const PRINT_AREA_PRESETS: Record<string, PrintArea> = {
  'T-Shirts': {
    front:     { widthRatio: 0.35, heightRatio: 0.52, fromTopRatio: 0.57, artworkScale: 0.88 },
    back:      { widthRatio: 0.35, heightRatio: 0.52, fromTopRatio: 0.57, artworkScale: 0.88 },
    leftChest: { widthRatio: 0.14, heightRatio: 0.14, fromTopRatio: 0.41, fromCenterRatio: -0.115, artworkScale: 0.9 },
  },
  'Sweatshirts': {
    front:     { widthRatio: 0.33, heightRatio: 0.46, fromTopRatio: 0.60, artworkScale: 0.85 },
    back:      { widthRatio: 0.33, heightRatio: 0.46, fromTopRatio: 0.58, artworkScale: 0.85 },
    leftChest: { widthRatio: 0.13, heightRatio: 0.13, fromTopRatio: 0.42, fromCenterRatio: -0.115, artworkScale: 0.9 },
  },
  'Hoodies': {
    front:     { widthRatio: 0.32, heightRatio: 0.44, fromTopRatio: 0.61, artworkScale: 0.84 },
    back:      { widthRatio: 0.32, heightRatio: 0.44, fromTopRatio: 0.59, artworkScale: 0.84 },
    leftChest: { widthRatio: 0.12, heightRatio: 0.12, fromTopRatio: 0.43, fromCenterRatio: -0.115, artworkScale: 0.88 },
  },
};

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: StudioState = {
  quantity:         50,
  deliverySpeed:    'Flexible Delivery',
  garmentColor:     'Bright White',
  customColorHex:   '#000000',
  activeView:       'front',
  artworkTechnique: 'Hybrid Digital Print',
  isFilterModalOpen: true,
  artworks: { front: null, neck: null, back: null, leftChest: null },
  leftChestLogo: false,
  artworkTransform: { width: 0, height: 0, fromNeck: 0, fromCenter: 0 },
  neckLabel: { dimensions: '50×18 mm', position: 'Below neck tape (5mm)', stitch: '2-corner' },
  signatureColors: [...DEFAULT_COLORS],
  baseImages: { ...DEFAULT_IMAGES },
  printArea: { ...DEFAULT_PRINT_AREA },
  productName: 'Classic T-Shirt 200',
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_QUANTITY';          qty: number }
  | { type: 'SET_DELIVERY_SPEED';    speed: string }
  | { type: 'SET_GARMENT_COLOR';     color: string }
  | { type: 'SET_CUSTOM_COLOR_HEX';  hex: string }
  | { type: 'SET_ACTIVE_VIEW';       view: ActiveView }
  | { type: 'SET_ARTWORK_TECHNIQUE'; tech: string }
  | { type: 'SET_ARTWORK';           view: keyof StudioState['artworks']; artwork: ArtworkFile | null }
  | { type: 'SET_LEFT_CHEST_LOGO';   enabled: boolean }
  | { type: 'SET_ARTWORK_TRANSFORM'; patch: Partial<ArtworkTransform> }
  | { type: 'SET_NECK_LABEL';        patch: Partial<NeckLabelConfig> }
  | { type: 'SET_FILTER_MODAL';      open: boolean }
  | { type: 'INIT_PRODUCT';          product: StudioProduct };

function reducer(state: StudioState, action: Action): StudioState {
  switch (action.type) {
    case 'SET_QUANTITY':
      return { ...state, quantity: action.qty };
    case 'SET_DELIVERY_SPEED':
      return { ...state, deliverySpeed: action.speed };
    case 'SET_GARMENT_COLOR':
      return { ...state, garmentColor: action.color };
    case 'SET_CUSTOM_COLOR_HEX':
      return { ...state, customColorHex: action.hex };
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.view };
    case 'SET_ARTWORK_TECHNIQUE':
      return { ...state, artworkTechnique: action.tech };
    case 'SET_ARTWORK':
      return { ...state, artworks: { ...state.artworks, [action.view]: action.artwork } };
    case 'SET_LEFT_CHEST_LOGO':
      return { ...state, leftChestLogo: action.enabled };
    case 'SET_ARTWORK_TRANSFORM':
      return { ...state, artworkTransform: { ...state.artworkTransform, ...action.patch } };
    case 'SET_NECK_LABEL':
      return { ...state, neckLabel: { ...state.neckLabel, ...action.patch } };
    case 'SET_FILTER_MODAL':
      return { ...state, isFilterModalOpen: action.open };
    case 'INIT_PRODUCT': {
      const p = action.product;
      const base = p.printArea ?? PRINT_AREA_PRESETS[p.category ?? ''] ?? DEFAULT_PRINT_AREA;
      return {
        ...state,
        productName: p.name ?? state.productName,
        signatureColors: p.colors ?? state.signatureColors,
        baseImages: p.images ?? state.baseImages,
        printArea: {
          ...base,
          leftChest: PRINT_AREA_PRESETS[p.category ?? '']?.leftChest ?? DEFAULT_LEFT_CHEST,
        },
      };
    }
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface StudioContextValue {
  state: StudioState;
  dispatch: React.Dispatch<Action>;
  // derived
  isNeckLabelEnabled: boolean;
  isCustomColorEnabled: boolean;
  availableTechniques: string[];
  // validated actions
  setQuantity: (qty: number) => void;
  setDeliverySpeed: (speed: string) => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

export function StudioProvider({
  children,
  product,
}: {
  children: React.ReactNode;
  product?: StudioProduct | null;
}) {
  const [state, dispatch] = useReducer(
    reducer,
    product ? reducer(initialState, { type: 'INIT_PRODUCT', product }) : initialState,
  );

  const isNeckLabelEnabled  = state.quantity >= 50 && state.deliverySpeed === 'Flexible Delivery';
  const isCustomColorEnabled = state.quantity >= 50 && state.deliverySpeed === 'Flexible Delivery';

  const availableTechniques = useMemo(() => {
    if (state.deliverySpeed === 'Fastest Delivery') return [];
    if (state.quantity < 50) return ['Digital Print (DTG)'];
    return [
      'Hybrid Digital Print', 'Screen Print', 'Puff Screen Print',
      'Embroidery', 'Embroidery 3D', 'Reflective Heat Transfer', 'Digital Print (DTG)',
    ];
  }, [state.deliverySpeed, state.quantity]);

  const setQuantity = (qty: number) => {
    dispatch({ type: 'SET_QUANTITY', qty });
    // re-coerce technique after qty change
    if (!availableTechniques.includes(state.artworkTechnique) && availableTechniques.length > 0) {
      dispatch({ type: 'SET_ARTWORK_TECHNIQUE', tech: availableTechniques[0] });
    }
    if (!isCustomColorEnabled && state.garmentColor !== 'Bright White') {
      dispatch({ type: 'SET_GARMENT_COLOR', color: 'Bright White' });
    }
  };

  const setDeliverySpeed = (speed: string) => {
    dispatch({ type: 'SET_DELIVERY_SPEED', speed });
    if (!availableTechniques.includes(state.artworkTechnique) && availableTechniques.length > 0) {
      dispatch({ type: 'SET_ARTWORK_TECHNIQUE', tech: availableTechniques[0] });
    }
    if (!isCustomColorEnabled && state.garmentColor !== 'Bright White') {
      dispatch({ type: 'SET_GARMENT_COLOR', color: 'Bright White' });
    }
  };

  const value: StudioContextValue = {
    state,
    dispatch,
    isNeckLabelEnabled,
    isCustomColorEnabled,
    availableTechniques,
    setQuantity,
    setDeliverySpeed,
  };

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used inside StudioProvider');
  return ctx;
}
