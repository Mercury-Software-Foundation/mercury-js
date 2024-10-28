import { TPluginInit, TPluginRun } from './platform';

export interface IStorageConfig {
  maxFileSize: number;
}

export type IStorageFile<T> = {
  id: string;
  name: string;
  filePath: string;
  size: number;
  tags: string[];
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
} & T;

export interface IStorage<T> {
  init: (initParams: TPluginInit) => Promise<void>;
  run: (runParams: TPluginRun) => Promise<void>;
  upload: (file: any) => Promise<IStorageFile<T>>;
  download: (fileId: string) => Promise<IStorageFile<T>>;
  delete: (fileId: string) => Promise<void>;
  list: () => Promise<IStorageFile<T>[]>;
  rename: (fileId: string, newName: string) => Promise<IStorageFile<T>>;
  move: (fileId: string, newPath: string) => Promise<IStorageFile<T>>;
  copy: (fileId: string, newPath: string) => Promise<IStorageFile<T>>;
  getMetadata: (fileId: string) => Promise<IStorageFile<T>>;
  updateTags: (
    fileId: string,
    addTags: string[],
    removeTags: string[]
  ) => Promise<IStorageFile<T>>;
  find: (query: string) => Promise<IStorageFile<T>[]>;
}
