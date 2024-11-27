import { PModel } from '../../../../types';
export const ShipmentTracking: PModel = {
  info: {
    name: 'ShipmentTracking',
    label: 'Shipment Tracking',
    description: 'Shipment Tracking model',
    managed: false,
    prefix: '',
    key: 'status'
  },
  fields: {
    update: {
        type: "string"
    },
    shipmentStatus: {
      type: "enum",
      enumType: "string",
      enum: ["IN_TRANSIT", "PACKAGING", "DISPATCH", "DELIVERED"],
      default: "PACKAGING"
    },
    order: {
        type: "relationship",
        ref: "Order"
    }
  },
  options: {
    historyTracking: false,
  },
};
