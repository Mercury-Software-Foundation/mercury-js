---
sidebar_position: 6
title: Fields
---

# Mercury Fields

In Mercury, fields are the building blocks of your data models. They define the structure and types of data that can be stored in each model. This guide provides a detailed explanation of field types and their properties in Mercury.

## Field Types and Structure

Mercury uses TypeScript types to define the structure of fields in a model. Here are the key types:

```
type TFields = {
  [fieldName: string]: TField;
};

type TField = {
  type:
    | 'string'
    | 'number'
    | 'float'
    | 'boolean'
    | 'relationship'
    | 'enum'
    | 'virtual'
    | 'mixed'
    | 'date';
  ref?: string;
  enum?: Array<string | number>;
  enumType?: string;
  required?: boolean;
  unique?: boolean;
  many?: boolean;
  localField?: string;
  foreignField?: string;
  bcrypt?: boolean;
  rounds?: number;
  ignoreGraphQL?: boolean;
  default?: any;
  [x: string]: any;
};
```

### TFields

`TFields` is a type that represents the structure of all fields in a model. It's an object where each key is the name of a field, and the corresponding value is of type `TField`.

### TField

`TField` is a type that defines the structure of an individual field. It includes the following properties:

- [`type`](./fields#supported-field-types) (Required): Specifies the data type of the field. It must be one of the supported Mercury types: 'string', 'number', 'float', 'boolean', 'relationship', 'enum', 'virtual', 'mixed', or 'date'.
- `ref` (Optional): Used for 'relationship' fields to specify the referenced model.
- `enum` (Optional): An array of allowed values for 'enum' fields.
- `enumType` (Optional): Specifies the type of enum values ('string' or 'number').
- `required` (Optional): A boolean indicating if the field is mandatory.
- `unique` (Optional): A boolean indicating if each value for this field must be unique across all documents.
- `many` (Optional): A boolean used for 'relationship' fields to indicate a one-to-many relationship.
- `localField` (Optional): Used for 'virtual' fields to specify the local field for population.
- `foreignField` (Optional): Used for 'virtual' fields to specify the foreign field for population.
- `bcrypt` (Optional): A boolean indicating if the value should be encrypted using bcrypt (for 'string' fields).
- `rounds` (Optional): The number of bcrypt rounds for encryption.
- `ignoreGraphQL` (Optional): A boolean to exclude the field from GraphQL schemas.
- `default` (Optional): Sets a default value for the field.
- `[x: string]: any`: Allows for additional Mongoose-supported properties to be included.

### Here's a detailed explanation of each field option:

1. **`ref`: string**
   - Used with 'relationship' type fields.
   - Specifies the name of the model that this field references.
   - **Example**: `ref: 'User'` in a 'Post' model to reference the 'User' model.

2. **`enum`: Array**
   - Used with 'enum' type fields.
   - Defines an array of allowed values for the field.
   - **Example**: `enum: ['admin', 'user', 'guest']`.

3. **`enumType`: string**
   - Specifies the type of values in the enum array ('string' or 'number').
   - **Example**: `enumType: 'string'` for string enums, `enumType: 'number'` for numeric enums.

4. **`required`: boolean**
   - If true, the field must have a value when saving a document.
   - **Example**: `required: true`.

5. **`unique`: boolean**
   - If true, ensures that no two documents in the collection have the same value for this field.
   - **Example**: `unique: true`.

6. **`many`: boolean**
   - Used with 'relationship' type fields.
   - If true, indicates a one-to-many relationship (the field will be an array of references).
   - **Example**: `many: true`.

7. **`localField`: string**
   - Used with 'virtual' type fields.
   - Specifies the field in the current model to match against in virtual population.
   - **Example**: `localField: '_id'`.

8. **`foreignField`: string**
   - Used with 'virtual' type fields.
   - Specifies the field in the referenced model to match against in virtual population.
   - **Example**: `foreignField: 'author'`.

9. **`bcrypt`: boolean**
   - If true, the field's value will be encrypted using bcrypt before saving.
   - Typically used for password fields.
   - **Example**: `bcrypt: true`.

10. **`rounds`: number**
    - Used in conjunction with `bcrypt`.
    - Specifies the number of bcrypt hashing rounds.
    - **Example**: `rounds: 10`.

11. **`ignoreGraphQL`: boolean**
    - If true, this field will be excluded from GraphQL schemas.
    - Useful for fields that shouldn't be exposed via API.
    - **Example**: `ignoreGraphQL: true`.

12. **`default`: any**
    - Sets a default value for the field if no value is provided.
    - Can be a static value or a function.
    - **Example**: `default: 'Unknown'` or `default: () => new Date()`.

13. **`[x: string]: any`**
    - This is a TypeScript index signature.
    - It allows for additional Mongoose-supported properties to be included.
    - Enables the use of any valid Mongoose SchemaType options not explicitly defined in Mercury.

## Supported Field Types

Mercury supports the following field types:

- `string`: For text data
- `number`: For integer values
- `float`: For decimal numbers
- `boolean`: For true/false values
- `relationship`: For references to other models
- `enum`: For fields with a predefined set of values
- `virtual`: For computed fields that don't persist in the database
- `mixed`: For fields that can hold any type of data
- `date`: For date and time values

These types are mapped to Mongoose types as follows:

- `string` → `String`
- `number` → `Number`
- `float` → `Number`
- `boolean` → `Boolean`
- `relationship` → `ObjectId` or `[ObjectId]`
- `enum` → `String` or `Number` with enum validation
- `virtual` → Mongoose virtual field
- `mixed` → `mongoose.Schema.Types.Mixed`
- `date` → `Date`

Only these types are directly supported by Mercury.js. For other Mongoose types, you can use the `mixed` type and handle the specifics in your application logic.

## Additional Mongoose-Supported Properties

> **Important:** Mercury's flexibility extends beyond its built-in field options!

Mercury provides a robust set of field properties, but it is not limited to these. The `[x: string]: any` index signature in the `TField` type allows for the inclusion of any additional Mongoose-supported SchemaType options in Mercury models.

This capability enables the use of any valid Mongoose SchemaType options not explicitly defined in Mercury, providing fine-grained control over data models.

For example, you might want to use Mongoose-specific validators, transformers, or other advanced options:

```typescript
{
  email: {
    type: 'string',
    required: true,
    unique: true,
    lowercase: true, // Mongoose-specific option
    validate: { // Custom Mongoose validator
      validator: function(v) {
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  }
}
```

To explore the full range of available SchemaType options and unleash the full potential of your Mercury models, we recommend checking out the [Mongoose SchemaType Options documentation](https://mongoosejs.com/docs/schematypes.html#schematype-options).

By combining Mercury's simplicity with Mongoose's power, you can create highly customized and efficient data models for your applications.

## Field Types and Usage

Mercury field types are mapped to Mongoose types as follows:

### Basic Types

1. **String**
   - Mercury: `string`
   - Mongoose: `String`
   - Usage:
     ```typescript
     fieldName: {
       type: 'string'
     }
     ```

2. **Number**
   - Mercury: `number`
   - Mongoose: `Number`
   - Usage:
     ```typescript
     fieldName: {
       type: 'number'
     }
     ```

3. **Float**
   - Mercury: `float`
   - Mongoose: `Number`
   - Usage:
     ```typescript
     fieldName: {
       type: 'float'
     }
     ```

4. **Boolean**
   - Mercury: `boolean`
   - Mongoose: `Boolean`
   - Usage:
     ```typescript
     fieldName: {
       type: 'boolean'
     }
     ```

5. **Date**
   - Mercury: `date`
   - Mongoose: `Date`
   - Usage:
     ```typescript
     fieldName: {
       type: 'date'
     }
     ```

### Complex Types

6. **Relationship**
   - Mercury: `relationship`
   - Mongoose: `ObjectId` or `[ObjectId]`
   - Usage:
     ```typescript
     fieldName: {
       type: 'relationship',
       ref: 'ModelName',
       many: boolean // optional, default is false
     }
     ```
   - `ref`: Specifies the name of the referenced model
   - `many`: If true, creates an array of ObjectIds (one-to-many relationship)

7. **Enum**
   - Mercury: `enum`
   - Mongoose: `String` or `Number` with enum validation
   - Usage:
     ```typescript
     fieldName: {
       type: 'enum',
       enumType: 'string' | 'number',
       enum: ['VALUE1', 'VALUE2', ...] | [1, 2, ...],
       default: 'VALUE1' | 1 // optional
     }
     ```
   - `enumType`: Specifies whether the enum values are strings or numbers
   - `enum`: An array of allowed values
   - `default`: Optional default value from the enum array

8. **Virtual**
   - Mercury: `virtual`
   - Mongoose: Mongoose virtual field
   - Usage:
     ```typescript
     fieldName: {
       type: 'virtual',
       ref: 'ModelName',
       localField: 'localFieldName',
       foreignField: 'foreignFieldName'
     }
     ```
   - `ref`: The model to use for population
   - `localField`: The field in the current model to match against
   - `foreignField`: The field in the referenced model to match against
   - This creates a virtual field that can be populated with related documents

9. **Mixed**
   - Mercury: `mixed`
   - Mongoose: `mongoose.Schema.Types.Mixed`
   - Usage:
     ```typescript
     fieldName: {
       type: 'mixed'
     }
     ```
   - Allows any type of data to be stored in this field

### Examples

Here are some examples demonstrating the usage of different field types:

```typescript
import mercury from "@mercury-js/core";

export const User = mercury.createModel(
  "User",
  {
    name: {
      type: "string",
      required: true
    },
    age: {
      type: "number",
      min: 0,
      max: 120
    },
    height: {
      type: "float",
      min: 0
    },
    isActive: {
      type: "boolean",
      default: true
    },
    birthDate: {
      type: "date"
    },
    profilePic: {
      type: "relationship",
      ref: "Asset"
    },
    friends: {
      type: "relationship",
      ref: "User",
      many: true
    },
    role: {
      type: "enum",
      enumType: "string",
      enum: ["CUSTOMER", "VENDOR", "ADMIN"],
      default: "CUSTOMER"
    },
    allocatedApartment: {
      type: "virtual",
      ref: "ApartmentAllocation",
      localField: "_id",
      foreignField: "customer"
    },
    additionalInfo: {
      type: "mixed"
    }
  }
);
```

This example demonstrates the usage of all supported field types in Mercury, including basic types, relationships, enums, virtual fields, and mixed fields.

Remember that you can add any additional Mongoose-supported properties to these field definitions, and they will behave as they do in Mongoose. This flexibility allows you to fine-tune your schema according to your specific requirements.
