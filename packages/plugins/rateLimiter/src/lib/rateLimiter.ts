import { createRateLimitRule, RedisStore } from 'graphql-rate-limit';
import { IRules, shield } from 'graphql-shield';
import _ from 'lodash';

type RateLimitRuleFunction = (options: { window: string; max: number }) => any;

export const Redis = RedisStore;
export const createRateLimitRuleContext = createRateLimitRule;
// Creating a rate limit rule function using graphql-rate-limit package
export const rateLimitRule: RateLimitRuleFunction = createRateLimitRule({
  identifyContext: (ctx) => ctx?.request?.ipAddress || ctx?.id,
});

// Define interface for options
interface RateLimiterOptions {
  window?: string;
  max?: number;
  rateLimitRuleFunc?: RateLimitRuleFunction;
  ignoreDefault?: boolean;
}

// Define interface for permission map
interface PermissionMap {
  [key: string]: {
    [key: string]: any;
  };
}

// Defining a rate limiter function that takes in a permission map and options object
export const rateLimiter = (
  permissionMap: PermissionMap = {},
  {
    window = '30s',
    max = 5,
    rateLimitRuleFunc = rateLimitRule,
    ignoreDefault = false,
  }: RateLimiterOptions = {}
) => {
  // Defining default permissions for Query and Mutation
  const defaultPermissions = {
    Query: {
      '*': rateLimitRuleFunc({ window, max }),
    },
    Mutation: {
      '*': rateLimitRuleFunc({ window, max }),
    },
  };

  // Merging default permissions with the permission map passed in
  const permissionMapOutput = ignoreDefault
    ? permissionMap
    : _.merge(defaultPermissions, permissionMap);

  // Returning a shield middleware with the final permission map
  return shield(permissionMapOutput as IRules, { allowExternalErrors: true });
};