---
sidebar_position: 7
title: Model Options
---
# Model Options

The **Model Options** object is used to configure a model's behavior in Mercury. It includes settings like adding MongoDB indexes to optimize queries.

```typescript
export type ModelOptions = {
  indexes?: Array<TIndex>;
  [x: string]: any;
};
```

## 1. Indexes

- ***`Type`***: `Array< TIndex >` (optional)
- ***`Description`***: This field defines an array of MongoDB indexes that can be applied to the model. Mercury works with indexes in the same way as Mongoose. You can use all Mongoose indexes here, including compound indexes, unique indexes, and more. The default index functionality of Mercury  can also be used.

For further details on MongoDB indexes(https://www.mongodb.com/docs/manual/indexes/) and how they can be used to optimize queries, refer to the official MongoDB Index Documentation.

### Example
```typescript
const userModel = mercury.createModel('User', fields, {
  indexes: [
    { fields: { email: 1 }, options: { unique: true } },  // Unique index on email
    { fields: { age: -1 } },  // Standard index on age
  ],
});
```

## 2. Additional Mongoose Options

In addition to the Mercury-specific options, you can pass any other Mongoose-supported schema options directly to the `options` object. This flexibility allows you to fine-tune your model's behavior using the full range of Mongoose features.

For example, you could add options like `timestamps`, `strict`, or `toJSON`:

```typescript
const userModel = mercury.createModel('User', fields, {
  timestamps: true,
  strict: false,
  toJSON: { virtuals: true }
});
```

These additional options will be passed directly to Mongoose when creating the model.

For a comprehensive list of all available Mongoose schema options and their descriptions, please refer to the [Mongoose Schema Options documentation](https://mongoosejs.com/docs/guide.html#options).
