'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/products';
import styles from './page.module.css';

type ViewKey = 'front' | 'back' | 'neck';

export default function ProductDetailView({ product }: { product: Product }) {
  const [activeView, setActiveView] = useState<ViewKey>('front');
  const [hoveredColor, setHoveredColor] = useState('');

  return (
    <div className={styles.productDetailPage}>

      {/* Header */}
      <header className={styles.detailHeader}>
        <div className={styles.detailHeaderInner}>
          <Link href="/" className={styles.backLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </Link>
          <span className={styles.detailBrand}><strong>Nibaaya</strong> Studio</span>
          <Link href={`/studio/${product.slug}`} className={styles.btnCustomizeHeader}>Customize</Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className={styles.breadcrumbBar}>
        <div className={styles.breadcrumbInner}>
          <Link href="/">Products</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span>{product.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.detailContent}>
        <div className={styles.detailGrid}>

          {/* Left: Images */}
          <div className={styles.detailImages}>
            <div className={styles.imageMain}>
              <img
                src={product.images[activeView]}
                alt={`${product.name} ${activeView}`}
                className={styles.mainImg}
              />
              <div className={styles.imgPlaceholder}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            </div>
            <div className={styles.imageThumbs}>
              {(['front', 'back', 'neck'] as ViewKey[]).map((view) => (
                <button
                  key={view}
                  className={`${styles.imgThumb} ${activeView === view ? styles.imgThumbActive : ''}`}
                  onClick={() => setActiveView(view)}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className={styles.detailInfo}>

            <div className={styles.detailMeta}>
              <span className={styles.detailCategory}>{product.category}</span>
            </div>

            <h1 className={styles.detailName}>{product.name}</h1>

            <p className={styles.detailDescription}>{product.description}</p>

            {/* Pricing block */}
            <div className={styles.pricingBlock}>
              <div className={styles.pricingMain}>
                <span className={styles.pricingLabel}>From</span>
                <span className={styles.pricingPrice}>₹{product.basePrice.toLocaleString('en-IN')}</span>
                <span className={styles.pricingPer}>/unit</span>
              </div>
              <div className={styles.pricingMrp}>
                MRP <s>₹{product.mrpPerUnit.toLocaleString('en-IN')}</s> incl. GST
              </div>
            </div>

            {/* MOQ */}
            <div className={styles.moqNotice}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Minimum order quantity: <strong>{product.moq} units</strong>
            </div>

            {/* Colors */}
            <div className={styles.detailSection}>
              <h3>
                Available Colours
                <span className={styles.countBadge}>{product.colors.length}</span>
              </h3>
              <div
                className={styles.colorsGrid}
                onMouseLeave={() => setHoveredColor('')}
              >
                {product.colors.map((color) => (
                  <span
                    key={color.name}
                    className={styles.colorSwatch}
                    style={{ background: color.hex }}
                    title={color.name}
                    onMouseEnter={() => setHoveredColor(color.name)}
                  />
                ))}
              </div>
              <p className={styles.colorNameLabel}>{hoveredColor}</p>
            </div>

            {/* Techniques */}
            <div className={styles.detailSection}>
              <h3>Print Techniques</h3>
              <div className={styles.techniquesWrap}>
                {product.techniques.map((tech) => (
                  <span key={tech} className={styles.techniqueTag}>{tech}</span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className={styles.detailSection}>
              <h3>Features</h3>
              <ul className={styles.featuresList}>
                {product.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Delivery */}
            <div className={styles.detailSection}>
              <h3>Delivery Options</h3>
              <div className={styles.deliveryGrid}>
                <div className={styles.deliveryItem}>
                  <span className={styles.deliveryLabel}>Fastest</span>
                  <span className={styles.deliveryDate}>{product.delivery.fastest}</span>
                </div>
                <div className={styles.deliveryItem}>
                  <span className={styles.deliveryLabel}>Standard</span>
                  <span className={styles.deliveryDate}>{product.delivery.fast}</span>
                </div>
                <div className={styles.deliveryItem}>
                  <span className={styles.deliveryLabel}>Flexible</span>
                  <span className={styles.deliveryDate}>{product.delivery.flexible}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link href={`/studio/${product.slug}`} className={styles.btnStudioCta}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Customize This Product
            </Link>

          </div>
        </div>
      </div>

    </div>
  );
}
