import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { applyMiddleware } from 'graphql-middleware';
import mercury from '@mercury-js/core';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import dotenv from 'dotenv';
import { GraphQLError } from 'graphql';
import './models';
import './hooks';
import './profiles';
dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

mercury.addGraphqlSchema(
  `type Query {
    hello(name: String): String
}`,
  {
    Query: {
      hello: (root: any, { name }: { name: string }, ctx: any) => {
        try {
          return `Hello ${name || 'World'}`;
        } catch (error) {
          throw new GraphQLError('Something went wrong');
        }
      },
    },
  }
);
const schema = applyMiddleware(
  makeExecutableSchema({
    typeDefs: mercury.typeDefs,
    resolvers: mercury.resolvers,
    // schemaDirectives,
  })
);

(async function startApolloServer() {
  // connect db to mercury
  mercury.connect(
    process.env.DB_URL ||
      'mongodb+srv://admin:forms123@cluster0.bvvpuvc.mongodb.net/newVersion'
  );

  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    introspection: true,
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    rootValue: () => {
      return {
        mercuryResolvers: mercury.resolvers,
      };
    },
  });
  await server.start();

  app.use(
    '/graphql',
    bodyParser.json(),
    //limiter,
    expressMiddleware(server, {
      context: async ({ req }) => {
        return { ...req, user: { profile: 'USER' } };
      },
    })
  );
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4001 }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:4001/graphql`);
})();
