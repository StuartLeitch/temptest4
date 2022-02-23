export const CATALOG_ITEM_UPDATE = `
  mutation updateCatalogItem(
    $catalogItem: CatalogInput!
  ) {
    updateCatalogItem(
      catalogItem: $catalogItem
    ) {
      publisherName
      amount
    }
  }
`;
