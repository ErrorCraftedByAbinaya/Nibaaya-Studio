import { useMemo } from 'react';
import type { StudioState, PriceBreakdown } from '@/lib/types';

export const PRICING = {
  baseGarment: (qty: number): number => {
    if (qty >= 500) return 189;
    if (qty >= 200) return 219;
    if (qty >= 100) return 249;
    if (qty >=  50) return 289;
    return 349;
  },
  colorPremium: (colorName: string): number => {
    const free = ['Bright White', 'Ecru', 'Northern Droplet'];
    return free.includes(colorName) ? 0 : 20;
  },
  technique: {
    'Digital Print (DTG)':       80,
    'Hybrid Digital Print':      110,
    'Screen Print':              95,
    'Puff Screen Print':         145,
    'Embroidery':                195,
    'Embroidery 3D':             265,
    'Reflective Heat Transfer':  175,
  } as Record<string, number>,
  neckLabel: { '2-corner': 28, '2-side': 38, '4-corner': 52 } as Record<string, number>,
  neckLabelDimension: {
    '50×18 mm': 0, '60×20 mm': 8, '65×15 mm': 6, '45×45 mm': 18,
  } as Record<string, number>,
  delivery: {
    'Flexible Delivery': 0, 'Standard Delivery': 18, 'Express Delivery': 45,
  } as Record<string, number>,
};

export const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function usePricing(state: StudioState, isNeckLabelEnabled: boolean): PriceBreakdown {
  return useMemo(() => {
    const qty   = state.quantity;
    const items = [];

    const base = PRICING.baseGarment(qty);
    items.push({ label: 'Base Garment', sublabel: `${state.productName} × ${qty} units`, perUnit: base });

    const colorPrem = PRICING.colorPremium(state.garmentColor);
    if (colorPrem > 0) {
      items.push({ label: 'Garment Colour', sublabel: state.garmentColor, perUnit: colorPrem });
    }

    const techCost = PRICING.technique[state.artworkTechnique] || 0;
    if (state.artworks.front || state.artworks.neck) {
      items.push({ label: 'Artwork Technique', sublabel: state.artworkTechnique, perUnit: techCost });
    }

    const backExtra = state.artworks.back ? 70 : 0;
    if (backExtra > 0) {
      items.push({ label: 'Back Print', sublabel: 'Additional placement', perUnit: backExtra });
    }

    if (isNeckLabelEnabled && state.neckLabel.stitch) {
      const stitchCost = PRICING.neckLabel[state.neckLabel.stitch] || 0;
      const dimCost    = PRICING.neckLabelDimension[state.neckLabel.dimensions] || 0;
      items.push({
        label:    'Neck Label',
        sublabel: `${state.neckLabel.dimensions} · ${state.neckLabel.stitch} stitch`,
        perUnit:  stitchCost + dimCost,
      });
    }

    const deliveryCost = PRICING.delivery[state.deliverySpeed] || 0;
    if (deliveryCost > 0) {
      items.push({ label: 'Delivery Surcharge', sublabel: state.deliverySpeed, perUnit: deliveryCost });
    }

    const perUnit    = items.reduce((s, i) => s + i.perUnit, 0);
    const mrpPerUnit = Math.round(perUnit * 1.18);
    const totalOrder = perUnit * qty;

    return { items, perUnit, mrpPerUnit, totalOrder, qty, fmt };
  }, [
    state.quantity, state.garmentColor, state.artworkTechnique,
    state.artworks.front, state.artworks.neck, state.artworks.back,
    state.neckLabel, state.deliverySpeed, state.productName, isNeckLabelEnabled,
  ]);
}
