---
sidebar_position: 3
title: Getting started with Express
---

This guide will walk you through setting up a Next.js application with `@mercury-js/core`, enabling you to quickly build a robust and secure API backend.

```typescript
// server.ts
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { applyMiddleware } from 'graphql-middleware';
import mercury from '@mercury-js/core';
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

const app = express();

const server = new ApolloServer({
  schema,
});

const { url } = await startStandaloneServer(server, {
  context: async (req, res) => ({
    ...req,
    user: {
      id: '1',
      profile: 'Admin',
    },
  }),
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);

app.listen(3000, () => {
  console.log('Express server listening on port 3000');
});
```

For setting up models, hooks, and profiles, please refer to the [Next.js setup page](nextjs#creating-models). The process is similar.
