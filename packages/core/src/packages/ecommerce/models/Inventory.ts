import { PModel } from '../../../../types';

export const Inventory: PModel = {
  info: {
    name: 'Inventory',
    label: 'Inventory',
    description: 'Inventory',
    managed: true,
    prefix: 'INVENTORY',
  },
  fields: {
    product: {
      type: 'relationship',
      ref: 'Product',
    },
    totalQuantity: {
      type: 'number',
      default: 0,
    },
    bookedQuantity: {
      type: 'number',
      default: 0,
    },
    fulfilledQuatity: {
      type: 'number',
      default: 0,
    },
    variants: {
      type: 'relationship',
      ref: 'Variant',
      many: true,
    },
  },
  options: {
    historyTracking: false,
    indexes: [
      {
        fields: {
          product: 1,
          variants: 1,
        },
        options: {
          unique: true,
        },
      },
    ],
  },
};
