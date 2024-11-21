---
sidebar_position: 5
title: Models
---

## Mercury Models: Defining and Interacting with Your Data

In Mercury, models serve as the blueprints for your data structure. They define the shape of your data and translate directly into Mongoose schemas and GraphQL types. Beyond just defining the structure, Mercury models provide powerful methods for interacting with your data.

### Creating a Model

Use the `mercury.createModel` function to create a model:

```typescript
import mercury from '@mercury-js/core';

export const BlogPost = mercury.createModel(
  'BlogPost',
  {
    title: { type: 'string', required: true },
    content: { type: 'string' },
    author: { type: 'relationship', ref: 'User' },
    publishedAt: { type: 'date' },
  },
  {
    timestamps: true,
  }
);

```
To learn more about model creation, refer to [Creating a Model](mercury#4-creating-a-model).

### Interacting with Models

Once you've defined your models, you can interact with them using various methods. These methods are accessed through `mercury.db.[modelName].[method]`.

#### Available Methods

1. **create**: Create a new document
2. **update**: Update an existing document
3. **delete**: Delete a document
4. **get**: Retrieve a single document
5. **list**: Retrieve multiple documents
6. **count**: Count documents
7. **paginate**: Retrieve paginated results

All these methods incorporate access control based on user profiles and handle hook executions automatically.

#### Method Parameters

Most methods typically take the following parameters:

1. **data/query**: The data to be created/updated or the query to find documents
2. **user**: An object containing user information for access control
3. **options**: Additional options like population, selection, etc.

#### Examples

Let's look at some examples of how to use these methods:

1. **Create**

Syntax:
```typescript
mercury.db.[modelName].create(data, user, options)
```

Example:
```typescript
const newPost = await mercury.db.BlogPost.create(
  { title: 'My First Post', content: 'Hello, World!' },
  { id: ctx.user.id, profile: ctx.user.profile },
  { populate: ['author'] }
);
```

2. **Update**

Syntax:
```typescript
mercury.db.[modelName].update(id, data, user, options)
```

Example:
```typescript
const updatedPost = await mercury.db.BlogPost.update(
  postId,
  { title: 'Updated Title' },
  { id: ctx.user.id, profile: ctx.user.profile },
  { populate: ['author'] }
);
```

3. **Delete**

Syntax:
```typescript
mercury.db.[modelName].delete(id, user, options)
```

Example:
```typescript
await mercury.db.BlogPost.delete(
  postId,
  { id: ctx.user.id, profile: ctx.user.profile }
);
```

4. **Get**

Syntax:
```typescript
mercury.db.[modelName].get(query, user, options)
```

Example:
```typescript
const post = await mercury.db.BlogPost.get(
  { _id: postId },
  { id: ctx.user.id, profile: ctx.user.profile },
  { populate: ['author'] }
);
```

5. **List**

Syntax:
```typescript
mercury.db.[modelName].list(query, user, options)
```

Example:
```typescript
const posts = await mercury.db.BlogPost.list(
  { author: userId },
  { id: ctx.user.id, profile: ctx.user.profile },
  { populate: ['author'], sort: { publishedAt: -1 } }
);
```

6. **Count**

Syntax:
```typescript
mercury.db.[modelName].count(query, user, options)
```

Example:
```typescript
const postCount = await mercury.db.BlogPost.count(
  { id: ctx.user.id, profile: ctx.user.profile }
);
```

7. **Paginate**

Syntax:
```typescript
mercury.db.[modelName].paginate(query, paginationOptions, user, options)
```

Example:
```typescript
const regex = new RegExp(searchText, "i");
const query = {
  $or: [
    { title: { $regex: regex } },
    { content: { $regex: regex } },
  ],
};

const paginatedPosts = await mercury.db.BlogPost.paginate(
  query,
  { offset, limit, sort: { publishedAt: -1 } },
  { id: ctx.user.id, profile: ctx.user.profile },
  { populate: ['author'] }
);
```

### Advanced Model Access

Mercury models also provide access to the underlying Mongoose schema and model for more advanced operations.

#### mongoSchema

The `mongoSchema` property gives you access to the Mongoose schema methods:

```typescript
// Syntax
mercury.db.[modelName].mongoSchema.[schemaMethod]

// Example
const schemaFields = mercury.db.BlogPost.mongoSchema.paths;
```

Common `mongoSchema` operations:

```typescript
// Add a new field to the schema
mercury.db.BlogPost.mongoSchema.add({ newField: String });

// Get all virtual fields
const virtuals = mercury.db.BlogPost.mongoSchema.virtuals;

// Add a pre-save hook
mercury.db.BlogPost.mongoSchema.pre('save', function(next) {
  // Hook logic here
  next();
});
```

#### mongoModel

The `mongoModel` property allows you to use all built-in Mongoose methods:

```typescript
// Syntax
mercury.db.[modelName].mongoModel.[mongooseMethod]

// Example
const result = await mercury.db.BlogPost.mongoModel.aggregate([...]);
```

Common `mongoModel` operations:

```typescript
// Find documents with lean option
const leanDocs = await mercury.db.BlogPost.mongoModel.find().lean();

// Create an index
await mercury.db.BlogPost.mongoModel.createIndexes({ title: 1 });

// Perform a bulk write operation
const bulkOps = [
  { insertOne: { document: { title: 'New Post' } } },
  { updateOne: { filter: { _id: postId }, update: { $set: { title: 'Updated' } } } }
];
await mercury.db.BlogPost.mongoModel.bulkWrite(bulkOps);
```

#### For a comprehensive list of available Mongoose methods, refer to the [Mongoose documentation](https://mongoosejs.com/docs/api/model.html).

By leveraging these Mercury model methods and properties, you can efficiently interact with your data while benefiting from built-in access control and hook executions.

### Special Field Options: Bcrypt

Mercury provides a special field option for password hashing using bcrypt. When you define a field with the `bcrypt: true` option, Mercury automatically handles the hashing of the field value before storing it in the database.

Example:

```typescript
export const User = mercury.createModel('User', {
  username: { type: 'string', required: true },
  password: { type: 'string', bcrypt: true },
  // ... other fields ...
});
```

#### Password Verification - default generated method

When you use the `bcrypt: true` option, Mercury automatically creates a verification method for that field. The method name is generated as `verify${FieldName}`, with the field name in PascalCase. This method allows you to securely verify passwords without exposing the hashed value.

To use this verification method:

```typescript
const incomingPassword = 'userEnteredPassword';
const user = await mercury.db.User.get({ email: "user@example.com" }, ctx, {});
const isPasswordCorrect = await user.verifyPassword(incomingPassword);
// isPasswordCorrect will be true if the passwords match, false otherwise
```

#### Bcrypt Verification Method - manual usage of method

Alternatively, you can use the `verifyBcryptField` method for verification, which is especially useful when you need to perform the verification outside of the model instance context.

Syntax:
```typescript
mercury.db.[modelName].verifyBcryptField(model, fieldName, password, user)
```

Example:
```typescript
const user = await mercury.db.User.get({ email: "user@example.com" }, ctx, {});
const isPasswordCorrect = await mercury.db.User.verifyBcryptField(
  user,
  'password',
  incomingPassword,
  { id: ctx.user.id, profile: ctx.user.profile }
);
```

This method provides an alternative way to verify bcrypt fields, ensuring flexibility in how you handle password verification in your application.
