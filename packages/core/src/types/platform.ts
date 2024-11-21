import { TFields, TOptions } from './index';

export interface TCommon {
  id: string;
  _id: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PModel {
  info: ModelInfo;
  fields: TFields;
  options: TOptions;
}

export interface ModelInfo {
  name: string;
  label: string;
  description: string;
  managed: boolean;
  prefix: string;
  key?: string;
}
export interface TMetaModel extends TCommon {
  name: string;
  prefix: string;
  managed: boolean;
}

export interface TModelField extends TCommon {
  _doc: TModelField;
  model: string;
  modelName: string;
  fieldName: string;
  type: 'number' | 'string' | 'boolean';
  required: boolean;
  default: string;
  rounds: number;
  many: boolean;
  unique: boolean;
  ref: string;
  localField: string;
  foreignField: string;
  enumType: string;
  enumValues: string[];
  managed: boolean;
  fieldOptions: string[] | TFieldOption[]; // string or populated one?
}

export interface TFieldOption extends TCommon {
  model: string | TMetaModel;
  modelName: string;
  modelField: string | TModelField;
  fieldName: string;
  keyName: string;
  type: 'number' | 'string' | 'boolean';
  value: string;
  managed: boolean;
  prefix: string;
}

export interface TModelOption extends TCommon {
  model: string | TMetaModel;
  modelName: string;
  managed: boolean;
  keyName: string;
  value: string;
  type: string;
}
