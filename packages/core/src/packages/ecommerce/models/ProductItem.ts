import { PModel } from '../../../../types';
export const ProductItem: PModel = {
  info: {
    name: 'ProductItem',
    label: 'Product Item',
    description: 'ProductItem model',
    managed: true,
    prefix: 'PRODUCT_ITEM',
    key: 'name',
  },
  fields: {
    product: {
      type: 'relationship',
      ref: 'Product',
    },
    description: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    productAttribute: {
      type: 'relationship',
      ref: 'ProductAttribute',
    },
    images: {
      type: 'relationship',
      ref: 'File',
      many: true,
    },
    seo: {
      type: 'relationship',
      ref: "ProductSeo"
    }
  },
  options: {
    historyTracking: false,
  },
};
