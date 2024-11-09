import mercury, { Mercury, DB, ModelType } from '../../mercury';
import { initTRPC, ProcedureRouterRecord } from '@trpc/server';
import { TypeOf, ZodAny, ZodType, string, z } from 'zod';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import schema from '__test__/packages/schema';
import { zodToTs, createTypeAlias, printNode } from 'zod-to-ts';
import { TField } from '../../../types';

export const trpc = initTRPC.create();
const zObj: any = {
  String: z.string(),
  ID: z.string(),
  Int: z.number(),
};

type MercuryServerOptions = {
  t: typeof trpc;
};

type inputObj = {
  argName: string;
  argType: string | Array<string>;
  isArray: boolean;
};

type inputSchemaObj = {
  [key: string]: Array<inputObj>;
};
declare module '../../mercury' {
  interface Mercury {
    trpc: {
      appRouter: ReturnType<typeof createTrpcServer>;
      t: typeof trpc;
    };
  }
}

export default (config?: MercuryServerOptions) => {
  return (mercury: Mercury) => {
    if (!config) {
      config = {
        t: trpc,
      };
    }

    mercury.trpc = {
      t: config.t,
      appRouter: createTrpcServer(mercury, config),
    };
  };
};

const zFieldMapping: { [type: string]: any } = {
  string: z.string().optional(),
  id: z.string().optional(),
  int: z.number().optional(),
  number: z.number().optional(),
  float: z.number().optional(),
  boolean: z.boolean().optional(),
  date: z.date().optional(),
  relationship: z.string().optional(),
  virtual: z.string().optional(),
  mixed: z.string().optional(),
  objectId: z.string().optional(),
  decimal: z.number().optional(),
  undefined: z.any().optional(),
};

const getZField = (value: TField) => {
  const type = value.type === 'enum' ? value.enumType : value.type;
  if (!type) {
    return z.any();
  }
  let zfield = zFieldMapping[type];
  if (value?.many) zfield = zfield.array();
  if (!value?.required) zfield = zfield.optional();
  return zfield;
};

const getZObj = (mercury: Mercury, model: keyof DB) => {
  // console.log('My resolvers are', mercury.resolvers, mercury.typeDefs);
  const obj: any = {};
  const modelFields = mercury.list.find((v) => v.name === model)?.fields;
  if (modelFields) {
    Object.entries(modelFields).forEach(([key, value]) => {
      obj[key] = getZField(value);
    });
  }
  return obj;
};

export const createInterfaces = (
  mercury: Mercury,
  queryZodInputs: any,
  mutationZodInputs: any
) => {
  const rootDirectory = process.cwd();
  const fileName = 'zodtots.ts';
  const filePath = path.join(rootDirectory, fileName);
  const userSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['admin', 'user']),
    phone: z.string().optional(),
  });
  const { node, store } = zodToTs(userSchema, 'User');
  // @ts-ignore
  // console.log("node ", printNode(node));
  const operType = (record: string) => {
    const result: any = [];
    Object.keys(mercury.resolvers[record]).map((element: string) => {
      const schema = record === 'Query' ? queryZodInputs : mutationZodInputs;
      //@ts-ignore
      const { node } = zodToTs(schema[element], element);
      // console.log(element, printNode(node));
      const type = `${element}: import("@trpc/server").BuildProcedure<"${
        record === 'Query' ? 'query' : 'mutation'
      }", {
        _config: import("@trpc/server").RootConfig<{
            ctx: object;
            meta: object;
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: import("@trpc/server").DefaultDataTransformer;
        }>;
        _meta: object;
        _ctx_out: object;
        _input_in: ${printNode(node)}
        ;
        _input_out: ${printNode(node)}
        ;
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
      }, any>`;
      result.push(type);
    });
    return result;
  };
  const recordType = ['Query', 'Mutation'].map((record) => {
    return `${record}: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
      ctx: object;
      meta: object;
      errorShape: import("@trpc/server").DefaultErrorShape;
      transformer: import("@trpc/server").DefaultDataTransformer;
  }>, {
      ${operType(record).join(';\n')}
  }>
    `;
  });
  // console.log("Record", recordType);
  const fileContent = `declare function createTrpcServer(): import("@trpc/server").CreateRouterInner<
  import("@trpc/server").RootConfig<{
    ctx: object;
    meta: object;
    errorShape: import("@trpc/server").DefaultErrorShape;
    transformer: import("@trpc/server").DefaultDataTransformer;
  }>,
  {
    ${recordType.join(';\n')}
  }
>;

export type AppRouter = ReturnType<typeof createTrpcServer>;
`;
  fs.writeFileSync(filePath, fileContent, 'utf-8');
};

// type DB = 'User' | 'Account';

function createTrpcServer(mercury: Mercury, options: MercuryServerOptions) {
  const { t } = options;
  const procedure = t.procedure;
  const genProcedure = (model: keyof DB, action: string) => {
    const obj: any = getZObj(mercury, model);
    return procedure.input(z.object(obj));
  };
  // genetateType
  const inputSchemaMap = getAllProcedureInputs(mercury.typeDefs);
  // console.log('inputSchemaMap', inputSchemaMap);
  const zodInputs = createZodInputs(inputSchemaMap);
  // console.log('zodObj', zObj);

  const queryProcedures = createQueryProcedures(mercury, options, zodInputs);
  const mutationProcedures = createMutationProcedures(
    mercury,
    options,
    zodInputs
  );

  const queryZodInputs = createQueryZodInputs(
    getQueries(mercury.typeDefs),
    zodInputs
  );
  const mutationZodInputs = createMutationZodInputs(
    getMutations(mercury.typeDefs),
    zodInputs
  );
  // const tempRouter = {
  //   getUser: procedure
  //     .input(z.object({ name: z.string() }))
  //     .query(async ({ input }) => {
  //       return await mercury.db.User.get(input, {
  //         id: '1',
  //         profile: 'User',
  //       });
  //     }),
  // };
  // console.log('tempRouter', tempRouter);
  // console.log('quer\yProcedures', queryProcedures);
  // console.log('mutationProcedures', mutationProcedures);
  const data = t.router({
    Query: t.router(queryProcedures),
    Mutation: t.router(mutationProcedures),
  });
  createInterfaces(mercury, queryZodInputs, mutationZodInputs); // This will generate the type defs file
  return data;
  // return t.router({
  //   Query: t.router({
  //     getUser: procedure
  //       .input(z.object({ where: z.object({
  //         name: z.string().optional()
  //       }) }))
  //       .query(async ({ input }) => {
  //         return await mercury.db.User.get(input, {
  //           id: '1',
  //           profile: 'User',
  //         });
  //       }),
  //       listUser: procedure
  //       .input(z.object({ where: z.object({
  //         name: z.string().optional()
  //       }) }))
  //       .query(async ({ input }) => {
  //         return await mercury.db.User.get(input, {
  //           id: '1',
  //           profile: 'User',
  //         });
  //       }),
  //   }),
  // });
}

export const createQueryZodInputs = (queries: any, zodInputs: any) => {
  let zodObj: any = {};
  queries.map((query: any) => {
    zodObj[query.name] = getProcedureInput(query.inputArgName, zodInputs);
  });
  return zodObj;
};

export const createMutationZodInputs = (mutations: any, zodInputs: any) => {
  let zodObj: any = {};
  mutations.map((mutation: any) => {
    zodObj[mutation.name] = getProcedureInput(mutation.inputArgName, zodInputs);
  });
  return zodObj;
};

export const createQueryProcedures: any = (
  mercury: Mercury,
  options: MercuryServerOptions,
  zodInputs: any
) => {
  const { t } = options;
  const procedure = t.procedure;
  const allQueries: any = getQueries(mercury.typeDefs);
  const queryProcedures: { [key: string]: typeof procedure } = {};
  allQueries.map((query: any) => {
    const procedureReturnType = query.returnType;
    // @ts-ignore
    queryProcedures[query.name] = procedure
      .input(getProcedureInput(query.inputArgName, zodInputs))
      .query(async ({ input }) => {
        console.log('Input', input);
        // @ts-ignore
        return await mercury.resolvers?.Query[query.name](
          '',
          input,
          { user: { id: 1, profile: 'User' } },
          null
        );
      });
  });
  return queryProcedures;
};

const createMutationProcedures: any = (
  mercury: Mercury,
  options: MercuryServerOptions,
  zodInputs: any
) => {
  const { t } = options;
  const procedure = t.procedure;
  const allMutations: any = getMutations(mercury.typeDefs);
  const mutationProcedures: { [key: string]: typeof procedure } = {};
  allMutations.map((mutation: any) => {
    const procedureReturnType = mutation.returnType;
    //@ts-ignore
    mutationProcedures[mutation.name] = procedure
      .input(getProcedureInput(mutation.inputArgName, zodInputs))
      .mutation(async ({ input }) => {
        if (mutation.name == 'createUser')
          // console.log('Mutation', mutation, zodInputs['UserInput']);
          //@ts-ignore
          return await mercury.resolvers?.Mutation[mutation.name](
            '',
            input,
            { user: { id: 1, profile: 'Admin' } },
            null
          );
      });
  });
  return mutationProcedures;
};

export const getProcedureInput = (inputs: any, zodInputs: any) => {
  const obj: any = {};
  inputs.map((input: any) => {
    let zObjValue = zodInputs[input.argType];
    if (input.isArgArray && input.isArgArrayEleRequired)
      zObjValue = z.array(zObjValue);
    if (input.isArgArray && !input.isArgArrayEleRequired)
      zObjValue = z.array(zObjValue.optional());
    if (!input.isArgRequired) zObjValue = zObjValue.optional();
    if (input.isDefaultPresent)
      zObjValue = zObjValue.default(input.defaultValue);
    obj[input.argName] = zObjValue;
  });
  return z.object(obj);
};

// after getting the schema we need to execute this function , is it ok to store all input schema inside a variabel or do we need to create one file?
// self reference ?
export const createZodInputs = (inputObj: inputSchemaObj) => {
  Object.entries(inputObj).forEach(([key, value]) => {
    let obj: any = {};
    value.map((v: any) => {
      if (v.argName === 'enum') {
        obj[key] = z.enum(v.argType).optional();
      } else {
        if (!zObj[v.argType] && key !== v.argType) {
          const obj: any = {};
          obj[v.argType] = inputObj[v.argType];
          createZodInputs(obj);
        }
        if (zObj[v.argType]) {
          obj[v.argName] = zObj[v.argType];
          if (!v.isRequired) obj[v.argName] = obj[v.argName].optional();
          if (v.isArray) obj[v.argName] = z.array(obj[v.argName]).optional();
        }
        if (v.isDefaultPresent) {
          obj[v.argName] = obj[v.argName].default(v.defaultValue);
        }
      }
    });
    zObj[key] = z.object(obj);
  });
  return zObj;
};

// For all procedure inputs, after this create zod inputs
export function getAllProcedureInputs(data: any) {
  const inputTypes = _.map(data.definitions, (item) => {
    if (item?.kind === 'InputObjectTypeDefinition') {
      return item;
    }
  }).filter((item) => item);
  const finalTypes: any = {};
  const enumTypes: any = [];
  inputTypes.map((inputType) => {
    const inputTypeValue = inputType?.fields.map((arg: any) => {
      let argType: any = arg?.type;
      argType =
        argType?.name?.value ??
        argType?.type?.name?.value ??
        argType?.type?.type?.name?.value;
      return {
        argName: arg?.name?.value,
        argType: argType,
        isRequired: arg?.type?.kind === 'NonNullType',
        isArray: arg?.type?.kind === 'ListType' ? true : false,
        isDefaultPresent: arg.defaultValue?.value ? true : false,
        defaultValue:
          arg.defaultValue?.kind == 'IntValue'
            ? parseInt(arg.defaultValue?.value)
            : arg.defaultValue?.value,
      };
    });
    return (finalTypes[inputType?.name?.value] = inputTypeValue);
  });
  return { ...finalTypes, ...getEnumTypesData(data) };
}

function getEnumTypesData(data: any) {
  const result: any = {};
  const enumTypes = _.map(data.definitions, (item) => {
    if (item?.kind === 'EnumTypeDefinition') {
      return item;
    }
  }).filter((item) => item);
  enumTypes.map((enumType) => {
    result[enumType.name.value] = [
      {
        argName: 'enum',
        argType: enumType.values.map((value: any) => value?.name?.value),
      },
    ];
  });
  return result;
}

// For query inputs

export function getQueries(data: any) {
  const query = _.filter(data.definitions, (item) => {
    if (item?.name && item?.name?.value === 'Query') {
      return item;
    }
  });

  return query[0].fields.map((it: any) => {
    return {
      name: it?.name?.value,
      inputArgName: it?.arguments.map((arg: any) => ({
        argName: arg?.name?.value,
        argType: arg?.type?.name?.value
          ? arg?.type?.name?.value
          : arg?.type?.type?.name?.value,
        isArgArray:
          arg?.type?.kind === 'ListType' || arg?.type?.type?.kind == 'ListType'
            ? true
            : false,
        isArgArrayEleRequired:
          arg?.type?.type?.kind == 'NonNullType' ||
          arg?.type?.type?.type?.kind === 'NonNullType'
            ? true
            : false,
        isArgRequired: arg?.type?.kind === 'NonNullType' ? true : false,
        isDefaultPresent: arg.defaultValue?.value ? true : false,
        defaultValue:
          arg.defaultValue?.kind == 'IntValue'
            ? parseInt(arg.defaultValue?.value)
            : arg.defaultValue?.value,
      })),
      returnType: it?.type?.name?.value,
    };
  });
}

// For mutation inputs

function getMutations(data: any) {
  const query = _.filter(data.definitions, (item) => {
    if (item.name && item.name.value === 'Mutation') {
      return item;
    }
  });

  return query[0].fields.map((it: any) => {
    return {
      name: it?.name?.value,
      inputArgName: it.arguments.map((arg: any) => {
        let argType = arg?.type?.type;
        argType =
          argType?.name?.value ??
          argType?.type?.name?.value ??
          argType?.type?.type?.name?.value;
        return {
          argName: arg?.name?.value,
          argType: argType,
          isArgArray:
            arg?.type?.kind === 'ListType' ||
            arg?.type?.type?.kind == 'ListType'
              ? true
              : false,
          isArgArrayEleRequired:
            arg?.type?.type?.kind == 'NonNullType' ||
            arg?.type?.type?.type?.kind === 'NonNullType'
              ? true
              : false,
          isArgRequired: arg?.type?.kind === 'NonNullType' ? true : false,
          isDefaultPresent: arg.defaultValue?.value ? true : false,
          defaultValue:
            arg.defaultValue?.kind == 'IntValue'
              ? parseInt(arg.defaultValue?.value)
              : arg.defaultValue?.value,
        };
      }),
      returnTypeInput: it?.type?.name?.value
        ? it?.type?.name?.value
        : it?.type?.type?.name?.value,
      returnTypeKind: it?.type?.kind,
    };
  });
}

export function getAllProcedureOutputs(data: any) {}

/// zod inputs created after fetching data from typedefs and formatting it

//1.self reference
//2.Obj empty
//3.Other types - anythign missing?