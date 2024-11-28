import { PModel } from '../../../../types';
export const Order: PModel = {
  info: {
    name: 'Order',
    label: 'Order',
    description: 'Order model',
    managed: false,
    prefix: 'Order',
  },
  fields: {
    customer: {
      type: 'relationship',
      ref: 'Customer',
    },
    date: {
      type: 'date',
    },
    invoice: {
      type: 'relationship',
      ref: 'Invoice',
    },
    orderId: {
      type: 'string',
      unique: true,
      default: () => `OD${Math.floor(10000 + Math.random() * 90000)}`
    },
    shipmentStatus: {
      type: "enum",
      enumType: "string",
      enum: ["IN_TRANSIT", "PACKAGING", "DISPATCH", "DELIVERED", "CANCELLED"],
      default: "PACKAGING"
    },
    trackings: {
      type: "virtual",
      ref: "ShipmentTracking",
      many: true,
      localField: "_id",
      foreignField: "order"
    }
  },
  options: {
    historyTracking: false,
  },
};

// need to create order items
