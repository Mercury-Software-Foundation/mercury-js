import { PModel } from '../../../../types';
export const ProductSeo: PModel = {
  info: {
    name: 'ProductSeo',
    label: 'Product SEO',
    description: 'Product SEO model',
    managed: true,
    prefix: 'PRODUCT',
    key: 'metaTitle',
  },
  fields: {
    metaTitle: {
        type: 'string',
        required: true
    },
    metaDescription: {
        type: 'string'
    },
    keywords: {
        type: "string",
        many: true
    }
  },
  options: {
    historyTracking: false,
  },
};
