// import { RedisCache } from "../lib/redis";
// import { } from "@mercury-js/core"

// Check for mercury whether it can be taken directly from core
export interface RedisCacheConfig {
  prefix?: string;
  client?: ClientConfig;
};

export interface ClientConfig {
  url?: string
  socket: {
    tls?: boolean
  }
};

// declare module "@mercury-js/core" {
//   interface Mercury {
//     cache: RedisCache;
//   }
// }