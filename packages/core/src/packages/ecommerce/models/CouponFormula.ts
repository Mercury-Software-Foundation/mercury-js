import { PModel } from '../../../../types';
export const CouponFormula: PModel = {
  info: {
    name: 'CouponFormula',
    label: 'Coupon Formula',
    description: 'Coupon Formula model',
    managed: true,
    prefix: 'COUPON',
    key: 'code',
  },
  fields: {
    leftObj: {
      type: 'string',
    },
    leftValue: {
      type: 'string',
    },
    operator: {
      type: 'enum',
      enumType: 'string',
      enum: ['gt', 'eq'],
      default: 'gt',
    },
    rightType: {
      type: 'enum',
      enumType: 'string',
      enum: ['String', 'Array'],
      default: "String"
    },
    rightValue: {
      type: 'string'
    },
  },
  options: {
    historyTracking: false,
  },
};
