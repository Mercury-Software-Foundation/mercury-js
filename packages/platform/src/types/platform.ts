import { Mercury } from '@mercury-js/core';
import { ILogger } from './logger';
import { IAuth } from './auth';

export interface IPlatformConfig {
  uri: string;
  auth?: IAuth;
  logger: ILogger;
  plugins?: TPlugin[];
}

export type TPermissionsSet = { [x: string]: { core: boolean } };
export type TPluginInit = {
  core: Promise<Mercury>;
  logger: ILogger;
};

export type TPluginRun = {
  core: Promise<Mercury>;
  logger: ILogger;
};

export type TPlugin = {
  name: string;
  init: (initParams: TPluginInit) => Promise<void>;
  run: (runParams: TPluginRun) => Promise<void>;
};
