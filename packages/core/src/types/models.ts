import { TFields } from './index';
import type { HydratedDocument } from 'mongoose';

export type ModelWithFields<T> = T & { fields: TFields };
export type Keys<T, K extends keyof T> = T[K];
export type MongoModel<T> = HydratedDocument<T>;
