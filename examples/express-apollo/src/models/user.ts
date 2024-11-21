
import mercury from "@mercury-js/core";

export const User = mercury.createModel(
  "User",
  {
    name: {
      type: "string",
      required: true
    },
    email: {
      type: "string",
      required: true
    },
    mobile: {
      type: "string",
      required: true,
      unique: true
    },
    age: {
      type: "number",
      required: true
    },
    gender: {
      type: "enum",
      enum: ["FEMALE", "MALE", "OTHERS"],
      enumType: "string",
    },
    role: {
      type: "enum",
      enumType: "string",
      enum: ["CUSTOMER", "VENDOR"],
      default: "CUSTOMER",
    }
  }
);