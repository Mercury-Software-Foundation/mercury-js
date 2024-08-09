export const Market: PModel = {
  info: {
    name: 'Market',
    label: 'Market',
    description: 'Market model',
    managed: true,
    prefix: 'MARKET'
  },
  fields: {
    name: {
      type: "string",
    },
    description: {
      type: "string",
    },
    location: {
      type: "string",
    },
    isActive: {
      type: "boolean",
    },
    currency: {
      type: "string"
    },
    catalog: {
      type: "relationship",
      ref: "Catalog",
      many: true
    },
  },
  options: {
    historyTracking: false
  }
}