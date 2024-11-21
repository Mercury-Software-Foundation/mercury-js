import { merge } from 'lodash';
import { defaultTypeDefs, defaultResolvers } from './utility';
import { TModel, TFields, TOptions, THookParams, IPlugin } from '../types';

// import { log, loggerConfig, setLogger, defaultTypeDefs, defaultResolvers, MercuryLogger } from './utility';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import mongoose from 'mongoose';
import { Model } from './models';
import { Mgraphql } from './graphql';
import hook, { Hook } from './hooks';
import access, { Access } from './access';
import { DocumentNode } from 'graphql';

export type ModelType = Model;

export interface DB {
  [x: string]: Model;
}

// Define a class for the Mercury ORM
export class Mercury {
  // Initialize an empty array for storing models
  list: Array<TModel> = [];
  private typeDefsArr: string[] = [defaultTypeDefs];
  private resolversArr: any = defaultResolvers;
  // Initialize an empty object for storing models by name
  db: DB = {} as DB;
  public access: Access = access;
  public hook: Hook = hook;
  get typeDefs(): DocumentNode {
    return mergeTypeDefs(this.typeDefsArr);
  }

  get resolvers(): ReturnType<typeof mergeResolvers> {
    return mergeResolvers(this.resolversArr);
  }

  public addGraphqlSchema(typeDefs: string, resolvers: any) {
    this.typeDefsArr.push(typeDefs);
    this.resolversArr = mergeResolvers([this.resolversArr, resolvers]);
  }

  public async package(packages: Array<(mercury: Mercury) => Promise<void>>) {
    await Promise.all(packages.map((pkg) => pkg(this as Mercury)));
  }

  public plugins(plugins: Array<IPlugin>) {
    plugins.map((plugin: IPlugin) => {
      plugin.init(this);
      plugin.run();
    });
  }

  public connect(path: string) {
    mongoose.connect(path);
  }
  public async disconnect() {
    await mongoose.disconnect();
    await mongoose.connection.close();
  }
  // Create a new model with the specified name, fields, and options
  public createModel<ModelType>(
    name: string,
    fields: TFields,
    options?: TOptions
  ): void {
    // Define default options for the model
    const defaultOptions = {
      private: false,
    };

    // Merge the specified options with the default options
    options = merge(defaultOptions, options);

    // Create a new model object with the specified name, fields, and options
    const model: TModel = { name, fields, options };

    // Execute the CREATE_MODEL hook before creating the model
    this.hook.execBefore(
      'CREATE_MODEL',
      model as THookParams,
      [],
      (error: any) => {
        if (error) {
          throw error;
        }
      }
    );
    // Add the model to the list of models
    if (options.update) {
      // If the model is an update model, find the existing model and update it
      const index = this.list.findIndex((m) => m.name === name);
      this.list[index] = model;
    } else {
      // If the model is not an update model, add it to the list of models
      this.list.push(model);
    }

    // Create a new Model instance for the model and add it to the database
    (this.db as any)[model.name] = new Model(model);

    // If the model is private, do not add graphql typedefs
    if (!options.private) {
      // Create graphql typedefs
      const typeDefs = Mgraphql.genModel(
        model.name,
        model.fields,
        model.options
      );
      // To avoid duplicate typeDefs, we will replace typeDefs if it does already exist
      if (options.update) {
        const index = this.typeDefsArr.findIndex((td) =>
          td.includes(`get${model.name}(`)
        );
        this.typeDefsArr[index] = typeDefs;
      } else {
        this.typeDefsArr.push(typeDefs);
      }

      // Same for resolvers
      const createResolvers = Mgraphql.genResolvers(
        model.name,
        (this.db as any)[model.name]
      );
      this.resolversArr = mergeResolvers([this.resolversArr, createResolvers]);
    }
  }

  public deleteModel(model: string) {
    this.typeDefsArr = this.typeDefsArr.filter(
      (td) => !td.includes(`get${model}(`)
    );
    delete this.db[model];
    this.list = this.list.filter((om: TModel) => om.name !== model);
    delete this.resolversArr.Query['get' + model];
    delete this.resolversArr.Query['list' + model + 's'];
    ['create', 'update', 'delete'].map((prefix: string) => {
      delete this.resolversArr.Mutation[prefix + model];
      delete this.resolversArr.Mutation[prefix + model + 's'];
    });
  }
}
