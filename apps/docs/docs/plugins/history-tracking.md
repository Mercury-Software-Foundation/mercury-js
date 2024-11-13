---
sidebar_position: 1
title: History Tracking
---

# History Tracking

This feature is available for the Mercury JS framework, allowing you to maintain a history of changes for specific models. You can enable history tracking for certain models while skipping others.

## Features

- **Track Changes**: Keeps track of create, update, and delete operations for a model.
- **Selective Tracking**: Option to add history tracking to some models and skip others.
- **GraphQL Resolvers**: Automatically generates GraphQL resolvers for the `<Model>History` table (or corresponding history table for other models), including `list<Model>Histories`, `get<Model>History`, `create<Model>History`, `create<Model>Histories`, `update<Model>History`, `updateMany<Model>Histories`, `delete<Model>History`, and `deleteMany<Model>Histories`. These resolvers facilitate easy access and manipulation of history records.

## Usage

To enable history tracking for a model, use the following code:

``` typescript
mercury.createModel('User', UserSchema, { historyTracking: true, recordOwner: true });
```

- `historyTracking: true` enables history tracking for the specified model.

For more details on the `createModel` method, refer to the [Mercury Documentation](/docs/mercury#4-creating-a-model).

## Implementation

To implement history tracking, you need to import and add the history tracking package to Mercury in your main route or index file:
```typescript
import historyTracking from '@mercury-js/core/packages/historyTracking';
mercury.package([historyTracking()]);
```

Make sure to do this after establishing the database connection.

## Example

For the `User` model, a corresponding `UserHistory` table will be created to maintain records of user history. This table not only stores the changes made but also records the user who modified the data, enhancing accountability.

### Use Cases for Resolvers

- **list**: Retrieve a list of all user history records.
- **get**: Fetch a specific user history record by ID.
- **createUserHistory**: Create a new entry in the user history.
- **createUserHistories**: Batch create multiple user history entries.
- **update**: Update a specific user history record.
- **updateMany**: Update multiple user history records at once.
- **delete**: Remove a specific user history record.
- **deleteMany**: Delete multiple user history records in a single operation.

This plugin is designed to enhance data integrity and provide a clear audit trail for model changes.


