
export const Cart: PModel = {
  info: {
    name: 'Cart',
    label: 'Cart',
    description: 'Cart model',
    managed: true,
    prefix: 'CART'
  },
  fields: {
    customer: {
      type: "relationship",
      ref: "Customer"
    },
    totalAmount: {
      type: "float"
    },
    cartToken:{
      type: "string"
    },
    cartItems:{
      type: "virtual",
      ref: "CartItem",
      localField: "_id",
      foreignField: "cart",
      many: true
    },
  },
  options: {
    historyTracking: false,
    indexes: [
      {
        fields: {
          customer: 1,
          cartToken: 1,
        },
        options: {
          unique: true,
        },
      },
    ]
  }
}