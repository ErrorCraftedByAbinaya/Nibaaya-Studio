import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const domain = process.env.SHOPIFY_STORE_DOMAIN!;
const token  = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

export const storefront = createStorefrontApiClient({
  storeDomain: domain,
  apiVersion:  '2025-01',
  publicAccessToken: token,
});

export async function shopifyFetch<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const { data, errors } = await storefront.request(query, { variables });
  if (errors) throw new Error(JSON.stringify(errors));
  return data as T;
}
