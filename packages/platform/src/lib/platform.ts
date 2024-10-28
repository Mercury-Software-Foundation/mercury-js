import mercury, { Mercury } from '@mercury-js/core';
import { cloneDeep } from 'lodash';
import { IPlatformConfig, TPlugin, TPermissionsSet, ILogger, IAuth } from '../types';
import { Logger } from './logger';
import { JwtAuth } from "./jwtAuth";
import { EmailQueueService } from "./bullMq";
import { IBullMq } from '../types/bull';
interface IExtendedPlatformConfig extends IPlatformConfig {
  bullmq?: {
    queue: {
      name: string;
    };
    redis: {
      host: string;
      port: number;
    };
    email: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
  };
}

export class Platform {
  private _meta = cloneDeep(mercury);
  private _core = cloneDeep(mercury);
  private _plugins: TPlugin[] = [];
  private _permissions: TPermissionsSet = {};
  private _dbUri: string;
  private _logger: ILogger;
  private _auth: IAuth;
  private _emailQueue: IBullMq | null = null;

  set permissions(value: TPermissionsSet) {
    this._permissions = value;
  }

  get emailQueue(): IBullMq | null {
    return this._emailQueue;
  }

  core(pluginName: string): Promise<Mercury> {
    return new Promise((resolve, reject) => {
      if (this._permissions[pluginName].core) {
        resolve(this._core);
      } else {
        this._logger.error('Access Denied');
        reject('Access Denied');
      }
    });
  }

  constructor(
    config: IExtendedPlatformConfig = {
      uri: process.env['MONGODB_URL'] || 'mongodb://localhost:27017',
      logger: new Logger({
        name: 'Mercury',
        namespace: ['Mercury'],
        level: ['debug', 'info', 'warn', 'error'],
      }),
      auth: new JwtAuth({
        sessionDuration: 123,
        force2FA: false,
        mercury: this._core,
      }),
    }
  ) {
    if (config.plugins) this._plugins = config.plugins;

    this._dbUri = config.uri;
    this._logger = config.logger;
    
    if (config.bullmq) {
      this._emailQueue = new EmailQueueService({
        mercury: this._core,
        bullmq: config.bullmq.queue,
        redis: config.bullmq.redis,
        email: config.bullmq.email
      });
      this._logger.debug('Email queue service initialized');
    }

    this._auth = config.auth || new JwtAuth({
      sessionDuration: 123,
      force2FA: false,
      mercury: this._core,
    });

    this._meta.connect(this._dbUri);
    this._core.connect(this._dbUri);
  }

  async run() {
    this._logger.debug('Loading plugins');
    
    for (const plugin of this._plugins) {
      this._logger.debug(`Initializing plugin: ${plugin.name}`);
      await plugin.init({ 
        core: await this.core(plugin.name), 
        logger: this._logger,
        emailQueue: this._emailQueue 
      });
    }
  }

  
    
}