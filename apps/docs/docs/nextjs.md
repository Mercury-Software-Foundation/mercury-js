---
sidebar_position: 2
title: Getting started with Next.js
---

This guide will walk you through setting up a Next.js application with `@mercury-js/core`, enabling you to quickly build a robust and secure API backend.

### Project Structure

Here's a recommended project structure:

```
your-project
├── app
│   └── api
│       └── graphql
│           ├── route.ts
│           ├── models
│           │   ├── [your-model].ts
│           │   └── index.ts
│           ├── profiles
│           │   ├── [your-profile].ts
│           │   └── index.ts
│           └── hooks
│               ├── [your-hook].ts
│               └── index.ts
└── next.config.js
└── tsconfig.json
└── package.json
└── ...
```

- **app**: Contains your Next.js routes, including your API endpoints.
- **models**: Houses your Mongoose models.
- **profiles**: Stores your access control profiles.
- **hooks**: Holds pre- and post-event hooks for your models.
- **next.config.js**: Configures your Next.js application.
- **tsconfig.json**: Typescript configuration file.
- **package.json**: Contains project dependencies and scripts.

### Setting up the server

1. **Install `@mercury-js/core`:**

   ```bash
   npm install @mercury-js/core
   ```

2. **Install Other Dependencies:**

   ```bash
   npm install @as-integrations/next @apollo/server @graphql-tools/schema graphql-middleware
   ```

3. **Create a Route (`app/api/graphql/route.ts`):**

   ```typescript
   // app/api/graphql/route.ts
   import { startServerAndCreateNextHandler } from '@as-integrations/next';
   import mercury from '@mercury-js/core';
   import { ApolloServer } from '@apollo/server';
   import { makeExecutableSchema } from '@graphql-tools/schema';
   import { applyMiddleware } from 'graphql-middleware';
   import './models'; // Import your models
   import './profiles'; // Import your profiles
   import './hooks'; // Import your hooks

   // Connect to your MongoDB database
   mercury.connect(process.env.DB_URL || 'mongodb://localhost:27017/mercury');

   // Add additional GraphQL typedefs and resolvers (optional)
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

   // Create the GraphQL schema
   const schema = applyMiddleware(
     makeExecutableSchema({
       typeDefs: mercury.typeDefs,
       resolvers: mercury.resolvers as unknown as IResolvers<
         any,
         GraphQLResolveInfo
       >[],
     })
   );

   // Initialize Apollo Server
   const server = new ApolloServer({
     schema,
   });

   // Create Next.js handler
   const handler = startServerAndCreateNextHandler(server, {
     context: async (req, res) => ({
       ...req,
       user: {
         id: '1', // Example user ID
         profile: 'Admin', // Example user profile
       },
     }),
   });

   export async function GET(request: any) {
     return handler(request);
   }

   export async function POST(request: any) {
     return handler(request);
   }
   ```

### Creating Models

1. **Create Model Files (`models/[your-model].ts`):**

   ```typescript
   // models/User.model.ts
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
       password: {
         type: 'string',
         bcrypt: true,
       },
     },
     {}
   );

   // models/Account.model.ts
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

   ```
   > **Note:** The `password` field in the `User` model will automatically be encrypted and stored in the database. For more details, refer to the [bcrypt field section](model#special-field-options-bcrypt) in the model documentation.

2. **Export Models (`models/index.ts`):**

   ```typescript
   // models/index.ts
   export { User } from './User.model';
   export { Account } from './Account.model';
   ```

### Setting Up Profiles

1. **Create Profile Files (`profiles/[your-profile].ts`):**

   ```typescript
   // profiles/Admin.profile.ts
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

   // profiles/User.profile.ts
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
   ```

2. **Export Profiles (`profiles/index.ts`):**

   ```typescript
   // profiles/index.ts
   export { AdminProfile } from './Admin.profile';
   export { UserProfile } from './User.profile';
   ```

### Using Hooks

1. **Create Hook Files (`hooks/[your-hook].ts`):**

   ```typescript
   // hooks/User.hook.ts
   import { hook } from '@mercury-js/core';

   hook.before('CREATE_USER_RECORD', async function (this: any) {
     // Modify data before create
     this.data.name = 'Test 1';
   });

   hook.after('CREATE_USER_RECORD', async function (this: any, args: any) {
     console.log('AFTER CREATE hook', this);
   });
   ```

2. **Export Hooks (`hooks/index.ts`):**

   ```typescript
   // hooks/index.ts
   import './User.hook';
   ```

### Running the Server

1. **Start the Development Server:**

   ```bash
   npm run dev
   ```

Now, you have a Next.js application with a secure, efficient, and scalable API backend powered by `@mercury-js/core`. You can access your GraphQL API by making requests to your endpoint, for example:

```
http://localhost:3000/api/graphql
```

This structure can be modified and expanded to suit your specific needs, allowing you to build complex applications with ease and security using `@mercury-js/core`.
