import type { Color, PrintArea } from '@/lib/types';

export interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  moq: number;
  basePrice: number;
  mrpPerUnit: number;
  delivery: {
    fastest: string;
    fast: string;
    flexible: string;
  };
  colors: Color[];
  techniques: string[];
  images: {
    front: string;
    back: string;
    neck: string;
  };
  printArea: PrintArea;
  thumbnail: string;
}

export const products: Product[] = [
  {
    id: 1,
    slug: 'classic-tshirt-200',
    name: 'Classic T-Shirt 200',
    category: 'T-Shirts',
    description: 'Our most popular blank — a 200gsm ring-spun cotton tee with a relaxed unisex fit. Perfect for screen print, DTG, and embroidery.',
    features: [
      '200gsm ring-spun cotton',
      'Unisex relaxed fit',
      'Pre-shrunk',
      'Ribbed crew neck',
      'Taped neck and shoulders',
    ],
    moq: 15,
    basePrice: 289,
    mrpPerUnit: 374,
    delivery: { fastest: 'From 04/06', fast: 'From 17/06', flexible: '1–4 Weeks' },
    colors: [
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
    ],
    techniques: [
      'Hybrid Digital Print',
      'Screen Print',
      'Puff Screen Print',
      'Embroidery',
      'Embroidery 3D',
      'Reflective Heat Transfer',
      'Digital Print (DTG)',
    ],
    images: {
      front: '/images/garments/classic-tshirt-front.png',
      back:  '/images/garments/classic-tshirt-back.png',
      neck:  '/images/garments/classic-tshirt-neck.png',
    },
    printArea: {
      front:     { widthRatio: 0.36, heightRatio: 0.68, fromTopRatio: 0.57, artworkScale: 0.88 },
      back:      { widthRatio: 0.36, heightRatio: 0.68, fromTopRatio: 0.57, artworkScale: 0.88 },
      leftChest: { widthRatio: 0.10, heightRatio: 0.10, fromTopRatio: 0.30, fromCenterRatio: 0.123, artworkScale: 0.9 },
    },
    thumbnail: '/images/garments/classic-tshirt-front.png',
  },
  {
    id: 2,
    slug: 'classic-sweatshirt-500',
    name: 'Classic Sweatshirt 500',
    category: 'Sweatshirts',
    description: 'A 500gsm heavyweight fleece-back sweatshirt with a relaxed fit and ribbed crew neck. The go-to blank for bold prints and durable embroidery.',
    features: [
      '500gsm fleece-back cotton',
      'Relaxed unisex fit',
      'Ribbed crew neck, cuffs and hem',
      'Pre-shrunk',
      'Taped neck and shoulders',
    ],
    moq: 15,
    basePrice: 449,
    mrpPerUnit: 579,
    delivery: { fastest: 'From 06/06', fast: 'From 20/06', flexible: '1–4 Weeks' },
    colors: [
      { name: 'Bright White', hex: '#ffffff' },
      { name: 'Ecru',         hex: '#f5ebdf' },
      { name: 'True Black',   hex: '#111111' },
      { name: 'Heather Grey', hex: '#8d99ae' },
      { name: 'Odyssey Gray', hex: '#40454f' },
      { name: 'Dark Navy',    hex: '#161d2b' },
      { name: 'Amparo Blue',  hex: '#375791' },
      { name: 'Martini Olive',hex: '#63664d' },
    ],
    techniques: [
      'Screen Print',
      'Puff Screen Print',
      'Embroidery',
      'Embroidery 3D',
      'Hybrid Digital Print',
    ],
    images: {
      front: '/images/garments/classic-sweatshirt-500-front.png',
      back:  '/images/garments/classic-sweatshirt-500-back.png',
      neck:  '/images/garments/classic-sweatshirt-500-neck.png',
    },
    printArea: {
      front:     { widthRatio: 0.30, heightRatio: 0.58, fromTopRatio: 0.52, artworkScale: 0.85 },
      back:      { widthRatio: 0.30, heightRatio: 0.58, fromTopRatio: 0.52, artworkScale: 0.85 },
      leftChest: { widthRatio: 0.10, heightRatio: 0.10, fromTopRatio: 0.31, fromCenterRatio: 0.100, artworkScale: 0.9 },
    },
    thumbnail: '/images/garments/classic-sweatshirt-500-front.png',
  },
  {
    id: 3,
    slug: 'classic-polo-shirt-280',
    name: 'Classic Polo Shirt 280',
    category: 'Polo Shirts',
    description: 'A 280gsm piqué cotton polo with a clean tailored collar and three-button placket. Built for embroidery, screen print, and left-chest logo work.',
    features: [
      '280gsm piqué cotton',
      'Tailored unisex fit',
      'Three-button placket',
      'Ribbed collar and cuffs',
      'Pre-shrunk',
      'Taped neck and shoulders',
    ],
    moq: 15,
    basePrice: 359,
    mrpPerUnit: 469,
    delivery: { fastest: 'From 05/06', fast: 'From 19/06', flexible: '1–4 Weeks' },
    colors: [
      { name: 'Bright White', hex: '#ffffff' },
      { name: 'True Black',   hex: '#111111' },
      { name: 'Dark Navy',    hex: '#161d2b' },
      { name: 'Amparo Blue',  hex: '#375791' },
      { name: 'Odyssey Gray', hex: '#40454f' },
      { name: 'Martini Olive',hex: '#63664d' },
      { name: 'Seagrass',     hex: '#9fb09f' },
      { name: 'Ecru',         hex: '#f5ebdf' },
    ],
    techniques: [
      'Embroidery',
      'Embroidery 3D',
      'Screen Print',
      'Puff Screen Print',
      'Reflective Heat Transfer',
      'Hybrid Digital Print',
    ],
    images: {
      front: '/images/garments/classic-polo-shirt-280-front.png',
      back:  '/images/garments/classic-polo-shirt-280-back.png',
      neck:  '/images/garments/classic-polo-shirt-280-neck.png',
    },
    printArea: {
      front:     { widthRatio: 0.34, heightRatio: 0.60, fromTopRatio: 0.56, artworkScale: 0.85, notch: { widthRatio: 0.22, heightRatio: 0.26 } },
      back:      { widthRatio: 0.34, heightRatio: 0.60, fromTopRatio: 0.56, artworkScale: 0.85 },
      leftChest: { widthRatio: 0.12, heightRatio: 0.12, fromTopRatio: 0.40, fromCenterRatio: -0.11, artworkScale: 0.88 },
    },
    thumbnail: '/images/garments/classic-polo-shirt-280-front.png',
  },
];

export function getProduct(slug: string): Product | null {
  return products.find((p) => p.slug === slug) ?? null;
}
