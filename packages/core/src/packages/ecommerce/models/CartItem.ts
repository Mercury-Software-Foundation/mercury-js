import { PModel } from '../../../../types';

export const CartItem: PModel = {
  info: {
    name: 'CartItem',
    label: 'Cart Item',
    description: 'Cart model',
    managed: true,
    prefix: 'CART_ITEM',
  },
  fields: {
    productItem: {
      type: 'relationship',
      ref: 'ProductItem',
    },
    priceBookItem: {
      type: 'relationship',
      ref: 'PriceBookItem',
    },
    quantity: {
      type: 'number',
    },
    amount: {
      type: 'number',
    },
    cart: {
      type: 'relationship',
      ref: 'Cart',
    },
  },
  options: {
    historyTracking: false,
  },
};
