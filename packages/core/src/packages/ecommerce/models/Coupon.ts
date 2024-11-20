import { PModel } from '../../../../types';
export const Coupon: PModel = {
  info: {
    name: 'Coupon',
    label: 'Coupon',
    description: 'Coupon model',
    managed: true,
    prefix: 'COUPON',
    key: 'code'
  },
  fields: {
    code: {
      type: 'string',
      unique: true,
      required: true
    },
    discountType: {
      type: 'enum',
      enum: ['PERCENTAGE', 'FIXED_AMOUNT'],
      enumType: 'string',
      default: "FIXED_AMOUNT"
    },
    discountValue: {
      type: 'number',
    },
    maxDiscountPrice: {
      type: 'number',
    },
    minOrderPrice: {
      type: 'number',
    },
    formula: {
      type: "relationship",
      ref: "CouponFormula"
    },
    expiryDate: {
      type: 'date',
    },
    active: {
      type: "boolean",
      default: true
    }
  },
  options: {
    historyTracking: false,
  },
};
