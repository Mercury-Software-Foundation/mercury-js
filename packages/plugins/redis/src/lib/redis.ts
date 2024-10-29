import { RedisCacheConfig } from "../types/redisCache";
import { IPlugin } from "@mercury-js/core";
import type { Mercury } from "@mercury-js/core";
import { RedisClientType, createClient, SchemaFieldTypes } from 'redis';

// Module augmentation for Mercury type
declare module "@mercury-js/core" {
  export interface Mercury {
    cache: RedisCache;
  }
}


const redisFieldType = {
  string: SchemaFieldTypes.TEXT,
  number: SchemaFieldTypes.NUMERIC,
  boolean: SchemaFieldTypes.TAG,
  tag: SchemaFieldTypes.TAG,
  geo: SchemaFieldTypes.GEO,
  vector: SchemaFieldTypes.VECTOR,
};

type RedisFieldType = typeof redisFieldType;

function AfterHook(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  descriptor.value = async function (this: RedisCache, ...args: any[]) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const result = await originalMethod.apply(this, args);
      // return result;
      if (result instanceof Promise) {
        return result.then(async (res: any) => {
          return res;
        });
      } else {
        return result;
      }
    } catch (error: any) {
      console.log("Redis Client Error: ", error);
    }
    // Disconnect error
    finally {
      if (this.client.isOpen) {
        await this.client.disconnect();
      }
    }
  };
  return descriptor;
}

export class RedisCache implements IPlugin {
  public _mercury?: Mercury;
  public installed: boolean;
  public prefix: string;
  public client: RedisClientType;
  public models: any[];
  // private isInitialized: boolean = false;

  constructor({ prefix = 'redis', client }: Partial<RedisCacheConfig>) {
    this.prefix = prefix;
    this.installed = false;
    this.models = [];
    this.client = createClient(client);
    this.initializeClient();
  }

  private async initializeClient() {
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
    });

    this.client.on('disconnect', () => {
      console.log('Redis Client Disconnected');
    });
  }

  init(mercury: Mercury) {
    this.installed = true;
    this._mercury = mercury;
    // Extend mercury to include cache property
    (this._mercury as any).cache = this;
    this.connect();
  }

  private get mercury(): Mercury {
    if (!this._mercury) throw new Error("Mercury instance is not initialized!");
    return this._mercury;
  }

  private async connect() {
    // Add logger 
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  run() {
    if (!this.installed) {
      throw new Error('Redis Cache package is not installed!!');
    }
  }

  setClient(client: RedisClientType) {
    this.client = client;
  }

  @AfterHook
  async set(key: string, value: string) {
    await this.client.set(key, value);
  }

  async delete(key: string) {
    await this.client.del(key);
  }

  @AfterHook
  async get(key: string) {
    return await this.client.get(key);
  }

  @AfterHook
  async createSchema(
    name: string,
    fields: {
      [x: string]: {
        type: keyof RedisFieldType;
        sortable?: boolean;
        noindex?: boolean;
      };
    },
    options: any
  ) {
    try {
      this.models.push({ name, fields, options });
      const fieldMap: { [x: string]: any } = {};
      Object.keys(fields).forEach((key) => {
        const type = redisFieldType[fields[key].type];
        fieldMap[`$.${key}`] = {
          type,
          AS: key,
          SORTABLE: fields[key].sortable ?? true,
          NOINDEX: fields[key].noindex ?? false,
        };
      });
      await this.client.ft.create(`${this.prefix}:${name}`, fieldMap, {
        ON: 'JSON',
        PREFIX: `${this.prefix}:${name}:`,
      });
    } catch (e: any) {
      if (e.message === 'Index already exists') {
        return;
      } else {
        console.error(e);
        process.exit(1);
      }
    }
  }

  @AfterHook
  async insert(name: string, data: any) {
    await this.client.json.set(`${this.prefix}:${name}:${data.id}`, '$', data);
    return data;
  }

  @AfterHook
  async search(name: string, query: string) {
    return await this.client.ft.search(`${this.prefix}:${name}`, query);
  }
}
