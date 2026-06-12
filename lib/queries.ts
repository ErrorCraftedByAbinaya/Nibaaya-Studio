export const STUDIO_PRODUCT_QUERY = `
  query StudioProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      variants(first: 1) {
        nodes {
          id
          price { amount currencyCode }
        }
      }
      metafield(namespace: "studio", key: "config") {
        value
      }
      images(first: 4) {
        nodes {
          url
          altText
        }
      }
    }
  }
`;
