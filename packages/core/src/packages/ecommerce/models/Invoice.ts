import { PModel } from '../../../../types';
export const Invoice: PModel = {
  info: {
    name: 'Invoice',
    label: 'Invoice',
    description: 'Invoice model',
    managed: false,
    prefix: 'INVOICE',
    key: "invoiceId"
  },
  fields: {
    customer: {
      type: 'relationship',
      ref: 'Customer',
    },
    totalAmount: {
      type: 'float',
    },
    discountedAmount: {
      type: 'float',
      default: 0
    },
    couponApplied: {
      type: "relationship",
      ref: "Coupon"
    },
    shippingAddress: {
      type: 'relationship',
      ref: 'Address',
    },
    billingAddress: {
      type: 'relationship',
      ref: 'Address',
    },
    payment: {
      type: 'relationship',
      ref: 'Payment',
      unique: true,
    },
    invoiceLines: {
      type: 'virtual',
      ref: 'InvoiceLine',
      localField: '_id',
      foreignField: 'invoice',
      many: true,
    },
    status: {
      type: 'enum',
      enumType: 'string',
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    document: {
      type: 'string',
    },
    invoiceId: {
      type: 'string',
      unique: true,
      default: () => `ID${Math.floor(10000 + Math.random() * 90000)}`
    },

  },
  options: {
    historyTracking: false,
  },
};
