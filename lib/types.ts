export interface Color {
  name: string;
  hex: string;
}

export interface PrintAreaView {
  widthRatio: number;
  heightRatio: number;
  fromTopRatio: number;
  artworkScale: number;
  notch?: { widthRatio: number; heightRatio: number };
}

export interface PrintAreaLeftChest extends PrintAreaView {
  fromCenterRatio: number;
}

export interface PrintArea {
  front: PrintAreaView;
  back: PrintAreaView;
  leftChest: PrintAreaLeftChest;
}

export interface StudioProduct {
  name: string;
  slug: string;
  shopifyVariantId?: string;
  category?: string;
  colors?: Color[];
  images?: { front: string; neck: string; back: string };
  printArea?: PrintArea;
}

export type ActiveView = 'front' | 'neck' | 'back';

export interface ArtworkFile {
  name: string;
  file: File;
}

export interface ArtworkTransform {
  width: number;
  height: number;
  fromNeck: number;
  fromCenter: number;
}

export interface NeckLabelConfig {
  dimensions: string;
  position: string;
  stitch: string;
}

export interface StudioState {
  quantity: number;
  deliverySpeed: string;
  garmentColor: string;
  customColorHex: string;
  activeView: ActiveView;
  artworkTechnique: string;
  isFilterModalOpen: boolean;
  artworks: {
    front: ArtworkFile | null;
    neck: ArtworkFile | null;
    back: ArtworkFile | null;
    leftChest: ArtworkFile | null;
  };
  leftChestLogo: boolean;
  artworkTransform: ArtworkTransform;
  neckLabel: NeckLabelConfig;
  signatureColors: Color[];
  baseImages: { front: string; neck: string; back: string };
  printArea: PrintArea;
  productName: string;
}

export interface PriceItem {
  label: string;
  sublabel: string;
  perUnit: number;
}

export interface PriceBreakdown {
  items: PriceItem[];
  perUnit: number;
  mrpPerUnit: number;
  totalOrder: number;
  qty: number;
  fmt: (n: number) => string;
}

export interface FabricCanvasHandle {
  addArtwork: (url: string) => void;
  removeArtwork: () => void;
  alignArtwork: (dir: string) => void;
  applyTransformFromState: () => void;
  addLeftChestArtwork: (url: string) => void;
  removeLeftChestArtwork: () => void;
}
