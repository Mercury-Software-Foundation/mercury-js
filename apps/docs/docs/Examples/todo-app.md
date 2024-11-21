---
sidebar_position: 1
title: Todo App with Next.js App Router and Mercury API
---

Let's craft a Todo App with Next.js App Router and Mercury API, incorporating features like custom lists, completed tasks, and user-specific access control.

**1. Setting Up Your Next.js Project**

Start by scaffolding a Next.js project with the App Router enabled:

```bash
npx create-next-app@latest --experimental-app
```

**2. Install Mercury and Dependencies**

Integrate Mercury into your project:

```bash
npm install @mercury-js/core mongoose graphql graphql-middleware @apollo/server @as-integrations/next @graphql-tools/schema
```

**3. Project Structure**

Organize your project with a focus on clarity:

```
todo-app/
  app/
    api/
      mercury/
        route.ts
    (your page components)
  models/
    index.ts
    Todo.model.ts
    TodoList.model.ts
  profiles/
    index.ts
    User.profile.ts
  hooks/
    index.ts
    Todo.hook.ts
```

**4. Crafting the Mercury API (route.ts)**

- **Import and Connect:**

```typescript
import mercury from '@mercury-js/core';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { applyMiddleware } from 'graphql-middleware';
import './models';
import './profiles';
import './hooks';

mercury.connect(process.env.DB_URL || 'mongodb://localhost:27017/mercury');
```

- **Set up the GraphQL Server:**

```typescript
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
      id: '1', // Replace with actual user authentication logic
      profile: 'User',
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

**5. Define Data Models (models/)**

- **`Todo.model.ts`**

```typescript
import mercury from '@mercury-js/core';

export const Todo = mercury.createModel(
  'Todo',
  {
    title: { type: 'string', required: true },
    description: { type: 'string' },
    completed: { type: 'boolean', default: false },
    list: {
      type: 'relationship',
      ref: 'TodoList',
      required: true,
    },
    createdBy: {
      type: 'relationship',
      ref: 'User',
      autopopulate: true,
    },
  },
  {
    timestamps: true,
  }
);
```

- **`TodoList.model.ts`**

```typescript
import mercury from '@mercury-js/core';

export const TodoList = mercury.createModel(
  'TodoList',
  {
    name: { type: 'string', required: true },
    isCustom: { type: 'boolean', default: false },
    createdBy: {
      type: 'relationship',
      ref: 'User',
      autopopulate: true,
    },
  },
  {
    timestamps: true,
  }
);
```

- **`index.ts`**

```typescript
export { Todo } from './Todo.model';
export { TodoList } from './TodoList.model';
```

**6. Establish User Profiles (profiles/)**

- **`User.profile.ts`**

```typescript
import mercury from '@mercury-js/core';

const rules = [
  {
    modelName: 'Todo',
    access: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    // Only allow access to own todos
    recordLevelAccess: true,
    getRecordQuery: (user) => ({ createdBy: user.id }),
  },
  {
    modelName: 'TodoList',
    access: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    // Only allow access to own lists
    recordLevelAccess: true,
    getRecordQuery: (user) => ({ createdBy: user.id }),
  },
];

export const UserProfile = mercury.createProfile('User', rules);
```

- **`index.ts`**

```typescript
export { UserProfile } from './User.profile';
```

**7. Implement Hooks for Custom Logic (hooks/)**

- **`Todo.hook.ts`**

```typescript
import { hook } from '@mercury-js/core';

// Example: Prevent completing todos in a custom list
hook.before('UPDATE_TODO_RECORD', async function (this: any) {
  if (this.data.completed && this.record.list.isCustom) {
    throw new Error('Cannot complete todos in a custom list');
  }
});
```

- **`index.ts`**

```typescript
export { default as TodoHook } from './Todo.hook';
```

**8. Build Your Next.js Pages**

- Leverage Apollo Client to interact with your Mercury-powered GraphQL API.
- Structure your app with components for:
  - Todo list display
  - Adding new todos
  - Marking todos as complete
  - Creating and managing custom lists
  - Viewing completed tasks

**Example Page Component (using `react-query` for data fetching)**

```typescript
'use client';

import { useQuery, useMutation } from 'react-query';
import { gql } from '@apollo/client';
import { mercuryInstance } from '@/app/api/mercury/route';

const GET_TODOS = gql`
  query GetTodos {
    listTodo {
      _id
      title
      completed
    }
  }
`;

const Todos = () => {
  const { data, isLoading, error } = useQuery('todos', async () => {
    const result = await mercuryInstance.graphql(GET_TODOS);
    return result.data.listTodo;
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.map((todo) => (
        <li key={todo._id}>
          {todo.title} - {todo.completed ? 'Completed' : 'Pending'}
        </li>
      ))}
    </ul>
  );
};

export default Todos;
```

**Remember**

- Replace placeholders (`'1'`) with your actual user authentication logic.
- Tailor your frontend components and styling to your preferences.
- Consider additional features like filtering, sorting, and due dates.
- Explore Mercury's extensive capabilities (virtual fields, plugins) for advanced use cases.
