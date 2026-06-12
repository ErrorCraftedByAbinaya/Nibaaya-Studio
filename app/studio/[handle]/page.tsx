import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { StudioProvider } from '@/hooks/useStudioState';
import StudioApp          from '@/components/Studio/StudioApp';
import { getProduct, products } from '@/lib/products';

export function generateStaticParams() {
  return products.map((p) => ({ handle: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = getProduct(handle);
  return {
    title: product ? `Customize ${product.name} — Nibaaya Studio` : 'Nibaaya Studio',
  };
}

export default async function StudioPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = getProduct(handle);
  if (!product) notFound();

  return (
    <StudioProvider product={product}>
      <StudioApp product={product} />
    </StudioProvider>
  );
}
