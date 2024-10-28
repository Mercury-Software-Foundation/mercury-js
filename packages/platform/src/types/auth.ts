import { Mercury } from "@mercury-js/core";
import { TPluginInit, TPluginRun } from './platform';

export interface ISession<T> {
  token: string;
  expires: number;
  user: {
    username: string;
  } & T;
}

export interface IAuthConfig {
  mercury: Mercury;
  sessionDuration: number;
  force2FA: boolean;
}

export type TPasswordPolicyError  = {
  policyType: string;
  errorMsg: string;
}


export interface IAuth {
  register: <T, K>(user: T) => Promise<K | TPasswordPolicyError>; 
  init(initParams: TPluginInit): Promise<void>;
  run(runParams: TPluginRun): Promise<void>;
  login: <T>(username: string, password: string) => Promise<T>;
  logout: (token: string) => Promise<boolean>;
  verify: <T>(token: string) => Promise<T>;
  validatePasswordPolicy:  (password: string) => Promise<true | TPasswordPolicyError>;
  changePassword: (token: string, password: string) => Promise<true | TPasswordPolicyError>;
  forgotPassword: (username: string) => Promise<string>; 
  resetPassword: (tempToken: string, password: string) => Promise<true | TPasswordPolicyError>;
  enable2FA: (token: string) => Promise<void>;
  disable2FA: (token: string) => Promise<void>;
  verify2FA: <T>(token: string, code: string) => Promise<ISession<T>>;
  generate2FASecret: (token: string) => Promise<string>;
}
