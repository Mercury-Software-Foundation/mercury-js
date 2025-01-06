import { PModel } from '../../../../types';
export const Payment: PModel = {
  info: {
    name: 'Payment',
    label: 'Payment',
    description: 'Payment model',
    managed: true,
    prefix: 'Payment',
  },
  fields: {
    method: {
      type: 'enum',
      enumType: 'string',
      enum: ['OFFLINE', 'ONLINE'],
    },
    gateway: {
      type: 'enum',
      enum: ['RAZORPAY'],
      enumType: 'string',
    },
    amount: {
      type: 'string',
    },
    date: {
      type: 'date',
    },
    razorPayPaymentId: {
      type: 'string',
    },
    razorPayPaymentStatus: {
      type: 'string',
    },
    razorPaySignature: {
      type: 'string',
    },
    razorPayOrderId: {
      type: 'string',
    },
    razorPayOrderStatus: {
      type: 'string',
    },
    attempts: {
      type: 'number',
    },
    currency: {
      type: 'string',
    },
    status: {
      type: 'enum',
      enum: ['SUCCESS', 'FAILURE','PENDING',"REFUNDED"],
      enumType: 'string',
    },
    mode: {
      type: 'string',
    },
  },
  options: {
    historyTracking: false,
  },
};
