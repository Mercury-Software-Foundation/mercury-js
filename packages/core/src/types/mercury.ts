import type { Mercury } from "../index";

export type TModel = {
  fields: TFields;
  name: string;
  options?: TOptions;
};

export type TFields = {
  [fieldName: string]: TField;
};

export type TField = {
  type:
  | 'string'
  | 'number'
  | 'float'
  | 'boolean'
  | 'relationship'
  | 'enum'
  | 'virtual'
  | 'mixed'
  | 'date';
  ref?: string;
  enum?: Array<string | number>;
  enumType?: string;
  required?: boolean;
  unique?: boolean;
  many?: boolean;
  localField?: string;
  foreignField?: string;
  bcrypt?: boolean;
  rounds?: number;
  ignoreGraphQL?: boolean;
  default?: any;
  [x: string]: any;
};

export interface TOptions {
  historyTracking: boolean;
  update?: boolean;
  private?: boolean;
  indexes?: Array<TIndex>;
  [x: string]: any;
};

export type TIndex = {
  fields: TIndexFields;
  options?: TIndexOptions;
};

export type TIndexFields = {
  [fieldName: string]: number;
};

export type TIndexOptions = {
  unique?: boolean;
  sparse?: boolean;
  partialFilterExpression?: any;
  collation?: any;
  expireAfterSeconds?: number;
  [key: string]: any;
};

export interface IPlugin {
  init(mercury: Mercury): void;
  run(): void;
}

// export type TInit = {
//   mercury: Mercury,
//   [x: string]: any
// }