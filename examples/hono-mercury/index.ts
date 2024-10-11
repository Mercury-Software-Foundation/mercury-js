import { Hono } from "hono";
import { type RootResolver, graphqlServer } from "@hono/graphql-server";
import "./models";
import "./profiles";
import mercury from "@mercury-js/core";
import { applyMiddleware } from "graphql-middleware";
import { makeExecutableSchema } from "graphql-tools";
import type { Context, Next } from 'hono'

export const app = new Hono();

mercury.connect(
  "mongodb+srv://admin:forms123@cluster0.bvvpuvc.mongodb.net/hono"
);

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
const schema = applyMiddleware(
  makeExecutableSchema({
    typeDefs: mercury.typeDefs,
    resolvers: mercury.resolvers,
  })
);

app.get("/", (c) => {
  return c.json({ message: "Hello Bun!" });
});

app.use("*", async (ctx: Context, next: Next) => {
  ctx.set("user", {
    id: "122",
    profile: "Admin"
  });
  await next();
});

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

app.fire();

const port = parseInt(process.env.PORT!) || 3000;
console.log(`Running at http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
