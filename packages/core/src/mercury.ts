import { merge } from 'lodash';
import { historySchema, defaultTypeDefs, defaultResolvers } from './utility';
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
class Mercury {
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

  get resolvers() {
    return mergeResolvers(this.resolversArr);
  }

  // public createProfile(name: string, rules: Rule[]): void {
  //   access.createProfile(name, rules);
  // }

  public addGraphqlSchema(typeDefs: string, resolvers: any) {
    this.typeDefsArr.push(typeDefs);
    this.resolversArr = mergeResolvers([this.resolversArr, resolvers]);
  }

  public package(packages: Array<(mercury: Mercury) => void>) {
    packages.map((pkg) => pkg(this as Mercury));
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
      historyTracking: false,
      private: false,
    };

    // Merge the specified options with the default options
    options = merge(defaultOptions, options);

    // Create a new model object with the specified name, fields, and options
    const model: TModel = { name, fields, options };

    // Execute the CREATE_MODEL hook before creating the model
    this.hook.execBefore('CREATE_MODEL', model, (error: any) => {
      if (error) {
        throw error;
      }
    });
    // Add the model to the list of models
    this.list.push(model);

    // Create a new Model instance for the model and add it to the database
    (this.db as any)[model.name] = new Model(model);

    // If the model is private, do not add graphql typedefs
    if (!options.private) {
      // Create graphql typedefs
      this.typeDefsArr.push(
        Mgraphql.genModel(model.name, model.fields, model.options)
      );
      const createResolvers = Mgraphql.genResolvers(
        model.name,
        (this.db as any)[model.name]
      );
      this.resolversArr = mergeResolvers([this.resolversArr, createResolvers]);
    }
  }
}

const mercury: Mercury = new Mercury();
export type { Mercury };
export default mercury;
