---
sidebar_position: 4
title: Mercury
---
# Mercury

This guide provides a step-by-step overview of how to use the **Mercury** for managing GraphQL schemas and MongoDB models, along with examples of methods such as `connect`, `disconnect`, `addGraphqlSchema`, `createModel`, and `deleteModel`.

## Mercury Instance Properties

Before diving into the methods, let's look at some important properties of a Mercury instance:

- `mercury.db.[modelName]`: Provides access to all model functions for the specified model. [More info on models](model)

- `mercury.access`: Gives access to all methods related to access profiles. [Learn about access profiles](profiles)

- `mercury.hook`: Provides access to all hook methods. [Detailed information on hooks](hook)

- `mercury.typeDefs`: A getter that returns the merged GraphQL type definitions.

- `mercury.resolvers`: A getter that returns the merged GraphQL resolvers.

Note: `mercury` refers to an instance of the Mercury class.

## 1. Connecting to MongoDB

The `connect` method establishes a connection to the MongoDB database.

### Usage:
```typescript
mercury.connect(DB_URL);
```
### Example
```typescript
mercury.connect("mongodb://localhost:27017/mydatabase");
```
This connects the Mercury instance to a MongoDB database hosted locally.

## 2. Disconnecting from MongoDB

The `disconnect` method is used to close the MongoDB connection.
### Usage:
```typescript
await mercury.disconnect();
```
This gracefully closes the connection to MongoDB and shuts down the Mercury ORM instance.

## 3. Adding GraphQL Schema

The `addGraphqlSchema` method allows you to add custom type definitions and resolvers to the existing GraphQL schema.
### Usage:
```typescript
mercury.addGraphqlSchema(typeDefs, resolvers);
```
### Example
```typescript
const typeDefs = `
  type Query {
    getBook(id: ID!): Book
  }

  type Book {
    id: ID!
    title: String
    author: String
  }
`;

const resolvers = {
  Query: {
    getBook: async (_, { id }) => {
      return await mercury.db.Book.findById(id);
    },
  },
};

mercury.addGraphqlSchema(typeDefs, resolvers);
```
This adds a new GraphQL schema for querying a `Book` object.

## 4. Creating a Model

The `createModel` method allows you to define a MongoDB model in Mercury ORM.

### Usage:
```typescript
mercury.createModel(name, fields, options?);
```

Parameters:
- ***`name`***: Name of the model (e.g., "`User`")
- ***[`fields`](./fields.md)***: Fields of the model, including types and options
- ***[`options`](./options.md)***: Optional settings for the model

### Types

```typescript
type TModel = {
  fields: `TFields`;
  name: string;
  options?: TOptions;
};
```
### Note:
For a detailed explanation of the `TFields` and `TField` types, please refer to the [Field Types and Structure](./fields.md#field-types-and-structure) section in the Fields documentation.

### Example
```typescript
const fields = {
  name: { type: 'string', required: true },
  email: { type: 'string', required: true },
  age: { type: 'number', required: false },
  role: { type: 'enum', enum: ['USER', 'ADMIN'], default: 'USER' },
  createdAt: { type: 'date', default: Date.now },
};

mercury.createModel('User', fields);
```

This creates a `User` model with fields `name`, `email`, `age`, `role`, and `createdAt`.

Note that any additional Mongoose-supported properties can be included in the field definition and will behave as they do in Mongoose.

After creating a model, you can access its functions through `mercury.db.[modelName]`. For example, `mercury.db.User.findById(id)`.

## 5. Deleting a Model

The `deleteModel` method removes a model from Mercury ORM and the associated GraphQL schema.

### Usage:
```typescript
mercury.deleteModel(modelName);
```
### Example
```typescript
mercury.deleteModel('User');
```
This deletes the `User` model from the Mercury instance, removing the corresponding GraphQL type definitions and resolvers.

## Additional Features

### Access Control
You can manage access control for your models using `mercury.access`. This allows you to define and enforce access rules for different operations on your models.

### Hooks
Mercury provides a powerful hook system accessible via `mercury.hook`. You can use hooks to execute custom logic before or after certain operations on your models.

### GraphQL Integration
The `mercury.typeDefs` and `mercury.resolvers` getters provide access to the merged GraphQL type definitions and resolvers, respectively. These are useful when you need to integrate Mercury with a GraphQL server.




