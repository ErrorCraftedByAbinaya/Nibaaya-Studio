import Link from 'next/link';
import { products } from '@/lib/products';
import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Products — Nibaaya Studio',
  description: 'Premium custom garments. Configure, personalise, and order in bulk.',
};

export default function ProductsPage() {
  return (
    <div className={styles.productsPage}>

      {/*Header*/}
      <header className={styles.siteHeader}>
        <div className={styles.headerInner}>
          <div className={styles.headerBrand}>
            <span className={styles.brandLogo}><strong>Nibaaya</strong> Studio</span>
            <span className={styles.brandTagline}>Premium Custom Garments</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>B2 Custom Printing Platform</div>
          <h1 className={styles.heroTitle}>Design your merch.<br />We handle the rest.</h1>
          <p className={styles.heroSub}>From 15 units. Bulk discounts up to 500+ pieces. Express or flexible delivery.</p>
        </div>
      </section>

      {/* Products Grid */}
      <section className={styles.productsSection}>
        <div className={styles.productsInner}>
          <div className={styles.sectionMeta}>
            <h2 className={styles.sectionTitle}>Choose your Clothes</h2>
            <span className={styles.productCount}>{products.length} products</span>
          </div>

          <div className={styles.productsGrid}>
            {products.map((product) => (
              <article key={product.id} className={styles.productCard}>

                {/* Thumbnail */}
                <Link href={`/products/${product.slug}`} className={styles.cardMedia}>
                  <div className={styles.cardImgWrapper}>
                    <div className={styles.cardImgPlaceholder}>
                      <div className={styles.placeholderGradient} />
                    </div>
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className={styles.cardImg}
                    />
                  </div>
                  <div className={styles.cardCategoryBadge}>{product.category}</div>
                </Link>

                {/* Body */}
                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <h3 className={styles.cardTitle}>{product.name}</h3>
                    <div className={styles.cardPricing}>
                      <span className={styles.cardPrice}>from ₹{product.basePrice.toLocaleString('en-IN')}</span>
                      <span className={styles.cardUnit}>/unit</span>
                    </div>
                  </div>

                  {/* Color dots */}
                  <div className={styles.cardColors}>
                    {product.colors.slice(0, 6).map((color) => (
                      <span
                        key={color.name}
                        className={styles.colorDot}
                        style={{ background: color.hex }}
                        title={color.name}
                      />
                    ))}
                    {product.colors.length > 6 && (
                      <span className={styles.colorsMore}>+{product.colors.length - 6}</span>
                    )}
                  </div>

                  <p className={styles.cardMoq}>Min. order {product.moq} units</p>

                  {/* Actions */}
                  <div className={styles.cardActions}>
                    <Link href={`/studio/${product.slug}`} className={styles.btnCustomize}>
                      Customize
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  </div>
                </div>

              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.siteFooter}>
        <div className={styles.footerInner}>
          <span className={styles.footerBrand}><strong>Nibaaya</strong> Studio</span>
          <span className={styles.footerCopy}>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
}
