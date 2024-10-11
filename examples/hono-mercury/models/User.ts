import mercury from "@mercury-js/core";

export const User = mercury.createModel(
  "User",
  {
    name: {
      type: "string",
      required: true,
    },
    email: {
      type: "string",
      required: true,
      unique: true,
    },
    password: {
      type: "string",
      bcrypt: true,
    },
    role: {
      type: "enum",
      enumType: "string",
      enum: ["VIEWER", "ADMIN", "MOBILEUSER", "SUPERADMIN"],
      default: "VIEWER",
    },
  },
  {}
);
