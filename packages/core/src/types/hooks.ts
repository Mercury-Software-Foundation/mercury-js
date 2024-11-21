export type THookType = string | 'CREATE_MODEL' | 'CREATE_RECORD';
import { CtxUser, TFields, TOptions } from './index';

export interface Kareem {
  pre: (type: THookType, fn: () => void) => void;
  before: (type: THookType, fn: () => void) => void;
}

export interface THookParamsOptions {
  internal?: boolean;
  populate?: string[];
  select?: string[];
}

export interface THookParams {
  name: string;
  prevRecord?: unknown;
  deletedRecord?: unknown;
  records?: unknown[];
  filters?: object;
  count?: number;
  query?: unknown;
  data?: unknown;
  user: CtxUser;
  record?: unknown;
  fields?: TFields;
  options: { [x: string]: any } | THookParamsOptions | TOptions;
}
