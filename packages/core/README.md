# @mercury-js/core

## Overview

`@mercury-js/core` is a rapid API generation package that simplifies backend service development by generating Mongoose models, CRUD operations, GraphQL typedefs, and resolvers from a JSON model. It also supports pre- and post-event hooks and access control via profiles, enabling field-level and operation-level permissions.

## Installation

To get started, install the package using npm:

```bash
npm install @mercury-js/core
```

## Getting Started

### Setting Up the Server

Here’s an example of setting up a server with Next.js and Apollo Server:

```typescript
// route.ts for NextJS
// For Express, you can directly use Apollo Server setup
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import mercury from '@mercury-js/core';
import { ApolloServer } from '@apollo/server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { applyMiddleware } from 'graphql-middleware';
import './models';
import './profiles';
import './hooks';

mercury.connect(process.env.DB_URL || 'mongodb://localhost:27017/mercury');

mercury.addGraphqlSchema(
  `
  type Query {
    hello: String
  }
`,
  {
    Query: {
      hello: (root: any, args: any, ctx: any, resolveInfo: any) => {
        return 'Hello World!';
      },
    },
  }
);

const schema = applyMiddleware(
  makeExecutableSchema({
    typeDefs: mercury.typeDefs,
    resolvers: mercury.resolvers as unknown as IResolvers<
      any,
      GraphQLResolveInfo
    >[],
  })
);

const server = new ApolloServer({
  schema,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req, res) => ({
    ...req,
    user: {
      id: '1',
      profile: 'Admin',
    },
  }),
});

export const mercuryInstance = mercury;

export async function GET(request: any) {
  return handler(request);
}

export async function POST(request: any) {
  return handler(request);
}
```

### Creating Models

Define your data models using `mercury.createModel`. Here’s an example of user and account models:

```typescript
// User.model.ts
import mercury from '@mercury-js/core';

export const User = mercury.createModel(
  'User',
  {
    name: {
      type: 'string',
    },
    account: {
      type: 'relationship',
      ref: 'Account',
    },
    test: {
      type: 'string',
    },
    testv: {
      type: 'virtual',
      ref: 'Account',
      localField: 'account',
      foreignField: '_id',
      many: false,
    },
  },
  {}
);

// Account.model.ts
import mercury from '@mercury-js/core';

export const AccountSchema = {
  name: {
    type: 'string',
  },
  user: {
    type: 'relationship',
    ref: 'User',
  },
};

export const Account = mercury.createModel('Account', AccountSchema, {});

// index.ts
export { User } from './User.model';
export { Account } from './Account.model';
```

### Setting Up Profiles

Control access using profiles. Here’s how you can set up user and admin profiles:

```typescript
// User.profile.ts
import mercury from '@mercury-js/core';

const rules = [
  {
    modelName: 'User',
    access: {
      create: false,
      read: true,
      update: false,
      delete: false,
    },
  },
  {
    modelName: 'Account',
    access: {
      create: false,
      read: true,
      update: false,
      delete: false,
    },
    fieldLevelAccess: true,
    fields: {
      name: {
        read: false,
      },
    },
  },
];

export const UserProfile = mercury.createProfile('User', rules);

// Admin.profile.ts
import mercury from '@mercury-js/core';

const rules = [
  {
    modelName: 'User',
    access: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
  },
  {
    modelName: 'Account',
    access: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
  },
];

export const AdminProfile = mercury.createProfile('Admin', rules);

// index.ts
export { AdminProfile } from './Admin.profile';
export { UserProfile } from './User.profile';
```

### Using Hooks

Pre- and post-event hooks allow you to execute custom logic at various stages of CRUD operations. Here’s an example of how to use hooks:

```typescript
// User.hook.ts
import { hook } from '@mercury-js/core';

hook.before('CREATE_USER_RECORD', async function (this: any) {
  // Modify data before create
  this.data.name = 'Test 1';
  this.data.test = 'Test 3';
});

hook.after('CREATE_USER_RECORD', async function (this: any, args: any) {
  console.log('AFTER CREATE hook', this);
});

hook.before('UPDATE_USER_RECORD', function (this: any) {
  console.log('BEFORE UPDATE hook', this);
});

hook.after('UPDATE_USER_RECORD', function (this: any) {
  console.log('AFTER UPDATE hook', this);
});

hook.before('DELETE_USER_RECORD', function (this: any) {
  console.log('BEFORE DELETE hook', this);
});

hook.after('DELETE_USER_RECORD', function (this: any) {
  console.log('AFTER DELETE hook', this);
});

// index.ts
export { default as UserHook } from './User.hook';
```

`this` param that you get in hooks is the context of the operation. You can modify the data, access the user, and more.
Below is the object with params which are available in different pre and post hook calls carefully understand them to use in pre and post hook calls.

`name` is of type `string` which is the name of the model.
`user:` is a context user object passed from graphql setContext method. Which is used to check the user profile and access control and all the user properties.
`prevRecord?` is returned in `UPDATE` hooks, it is the record before the operation.
`deletedRecord?` is returned in `DELETE` hooks, it is the record that was deleted.
`records?` is returned in `LIST` and `PAGINATE` read hooks, it is the record that was queried using find.
`filters?`is returned in `PAGINATE(Read)` hooks, it is the filters that were used to query the records.
`count?` is of type `number` and is returned in `COUNT(Read)` hooks, it is the count of the records that were queried.
`query?`is a mongoose query object that is returned in most of the read call like GET, LIST, PAGINATE hooks, it is the query that was used to query the records.
`data?`is the payload that method receives which are used to create or update the record.
`record?` is the record that was created, updated, deleted or read in different hooks. It is a singular of records.
`options` is the options that are passed to the method like `populate`, `select`, `internal` etc. It is an object which is used by plugins to set some custom options to the method to be used in hooks.

## License

[MIT](LICENSE).