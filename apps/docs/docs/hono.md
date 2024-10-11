---
sidebar_position: 4
title: Getting started with Hono
---

This guide will walk you through setting up a Hono application with `@mercury-js/core`, enabling you to quickly build a robust and secure API backend.

### Project Structure

Here's a recommended project structure:

```
your-project
├── src
│   ├── index.ts
│   ├── models
│   ├── profiles
│   └── hooks
├── tsconfig.json
├── package.json
└── ...
```

### Setting up the server

1. **Install required dependencies:**

   ```bash
   npm install @mercury-js/core hono @hono/graphql-server graphql-middleware graphql-tools
   ```

2. **Create the main application file (`src/index.ts`):**

   ```typescript:src/index.ts
   import { Hono } from "hono";
   import { type RootResolver, graphqlServer } from "@hono/graphql-server";
   import "./models";
   import "./profiles";
   import mercury from "@mercury-js/core";
   import { applyMiddleware } from "graphql-middleware";
   import { makeExecutableSchema } from "graphql-tools";
   import type { Context, Next } from 'hono'

   export const app = new Hono();

   // Connect to your MongoDB database
   mercury.connect(process.env.DB_URL || "mongodb://localhost:27017/mercury");

   // Add additional GraphQL typedefs and resolvers (optional)
   const typeDefs = `
   type Query {
     hello: String
   }
   `;

   const resolvers = {
     Query: {
       hello: (root: any, {}, ctx: Context) => "Hello Hono!" + JSON.stringify(ctx.get("user")),
     },
   };
   mercury.addGraphqlSchema(typeDefs, resolvers);

   // Create the GraphQL schema
   const schema = applyMiddleware(
     makeExecutableSchema({
       typeDefs: mercury.typeDefs,
       resolvers: mercury.resolvers,
     })
   );

   // Add a middleware to set user context
   app.use("*", async (ctx: Context, next: Next) => {
     ctx.set("user", {
       id: "122",
       profile: "Admin"
     });
     await next();
   });

   // Set up GraphQL endpoint
   app.use(
     "/graphql",
     graphqlServer({
       schema,
       rootResolver: (c) => {
           return mercury.resolvers
       },
       graphiql: true,
     })
   );

   // Start the server
   app.fire();

   const port = parseInt(process.env.PORT!) || 3000;
   console.log(`Running at http://localhost:${port}`);

   export default {
     port,
     fetch: app.fetch,
   };
   ```

### Creating Models, Setting Up Profiles, and Using Hooks

For setting up models, hooks, and profiles, please refer to the [Next.js setup page](nextjs#creating-models). The process is similar.

### Running the Server

1. **Start the Development Server:**

   ```bash
   npm run dev
   ```

Now, you have a Hono application with a secure, efficient, and scalable API backend powered by `@mercury-js/core`. You can access your GraphQL API by making requests to your endpoint, for example:

```
http://localhost:3000/graphql
```

This setup allows you to leverage the speed and simplicity of Hono along with the powerful features of Mercury.js to build complex applications with ease and security.
